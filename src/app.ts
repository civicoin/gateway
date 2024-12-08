import chalk from 'chalk'
import dotenv from 'dotenv'
import fjwt from '@fastify/jwt'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import { JsonSchema } from 'fastify-zod'
import swaggerUi from '@fastify/swagger-ui'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import { UserPayload } from './types.js'
import rabbitmq from './plugins/rabbitmq.js'
import grpcClients from './plugins/grpcClient.js'
import { RabbitMQQueue } from './utils/rabbitmq.js'

import txRoutes from './api/transaction/tx.route.js'
import systemRoutes from './api/system/system.route.js'
import memberRoutes from './api/member/member.route.js'
import balanceRoutes from './api/balance/balance.route.js'
import { txSchemas } from './api/transaction/tx.schema.js'
import { systemSchemas } from './api/system/system.schema.js'
import { memberSchemas } from './api/member/member.schema.js'
import { balanceSchemas } from './api/balance/balance.schema.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
if (![JWT_SECRET].every(Boolean)) {
	throw new Error('Missing necessary environment variables')
}

const host = process.env.ADDRESS || '127.0.0.1'
const port = Number(process.env.PORT || 5000)
const address = `${host}:${port}`

const devLoggerOptions = {
	level: 'warn',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'yyyy-mm-dd HH:MM:ss',
			ignore: 'pid,hostname,reqId'
		}
	}
}

export const app = fastify({
	logger: process.env.NODE_ENV === 'production' || devLoggerOptions
})

export const logger = app.log

const swaggerOptions = {
	swagger: {
		info: {
			title: 'Civicoin Gateway API',
			description: 'API documentation',
			version: '0.1.0'
		},
		host: address,
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
		securityDefinitions: {
			Bearer: {
				type: 'apiKey' as const,
				name: 'Authorization',
				in: 'header'
			}
		}
	}
}

const swaggerUiOptions = {
	routePrefix: '/docs'
}

app.register(fjwt, { secret: String(JWT_SECRET) })
app.register(rabbitmq)
app.register(grpcClients)
app.register(swagger, swaggerOptions)
app.register(swaggerUi, swaggerUiOptions)
app.register(cors, {
	origin: true
})

app.addHook('onRequest', async (req: FastifyRequest) => {
	const authHeader = req.headers.authorization
	if (authHeader && !authHeader.startsWith('Bearer ')) {
		req.headers.authorization = `Bearer ${authHeader}`
	}
})

app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
	try {
		const decoded = await req.jwtVerify()
		req.user = decoded as UserPayload
	} catch (err) {
		return reply.send(err)
	}
})

app.decorate('core', async (req: FastifyRequest, reply: FastifyReply) => {
	try {
		// appropriate for system service
		// const systemId = req.user.systemId
		const grpcCoreService = app.grpc.coreClients.Core

		req.core = grpcCoreService
	} catch (err) {
		return reply.send(err)
	}
})

app.ready(async () => {
	try {
		await app.rabbitmq.subscribe(RabbitMQQueue.system, async message => {
			console.log(chalk.magenta(JSON.stringify(message)))
		})
	} catch (err) {
		app.log.error(err)
	}
})

const addSchemas = (schemas: JsonSchema[]) => schemas.forEach(schema => app.addSchema(schema))

const main = async () => {
	;[systemSchemas, memberSchemas, txSchemas, balanceSchemas].forEach(addSchemas)
	app.register(systemRoutes, { prefix: '/system' })
	app.register(memberRoutes, { prefix: '/member' })
	app.register(txRoutes, { prefix: '/tx' })
	app.register(balanceRoutes, { prefix: '/balance' })

	try {
		await app.listen({ port, host })
		console.log(chalk.green.bgBlack(`Server listening at ${address}`))
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

main()
