import chalk from 'chalk'
import dotenv from 'dotenv'
import { LoggerOptions } from 'pino'
import swagger from '@fastify/swagger'
import { JsonSchema } from 'fastify-zod'
import swaggerUi from '@fastify/swagger-ui'
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import rabbitmq from './plugins/rabbitmq.js'
import grpcClient from './plugins/grpcClient.js'
import { RabbitMQQueue } from './utils/rabbitmq.js'

import systemRoutes from './api/system/system.route.js'
import memberRoutes from './api/member/member.route.js'
import { systemSchemas } from './api/system/system.schema.js'
import { memberSchemas } from './api/member/member.schema.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
if (![JWT_SECRET].every(Boolean)) {
	throw new Error('Missing necessary environment variables')
}

const host = process.env.ADDRESS || '0.0.0.0'
const port = Number(process.env.PORT || 5000)
const address = `${host}:${port}`

const devLoggerOptions: LoggerOptions = {
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
		produces: ['application/json']
	}
}

const swaggerUiOptions = {
	routePrefix: '/docs'
}

app.register(fjwt, { secret: String(JWT_SECRET) })
app.register(rabbitmq)
app.register(grpcClient)
app.register(swagger, swaggerOptions)
app.register(swaggerUi, swaggerUiOptions)

app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
	try {
		const token = ''
		const decoded = req.jwt.verify<FastifyJWT['user']>(token)

		req.user = decoded
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
	;[systemSchemas, memberSchemas].forEach(addSchemas)
	app.register(systemRoutes, { prefix: '/system' })
	app.register(memberRoutes, { prefix: '/member' })

	try {
		await app.listen({ port, host })
		console.log(chalk.green.bgBlack(`Server listening at ${address}`))
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

main()
