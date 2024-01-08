import chalk from 'chalk'
import dotenv from 'dotenv'
import { JsonSchema } from 'fastify-zod'
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import rabbitmq from './plugins/rabbitmq.js'
import { RabbitmqQueue } from './utils/rabbitmq.js'

import systemRoutes from './api/system/system.route.js'

import { systemSchemas } from './api/system/system.schema.js'

dotenv.config()

const JWT_SECRET = process.env.SECRET
if (![JWT_SECRET].every(Boolean)) {
	throw new Error('Missing necessary environment variables')
}

const app = fastify({
	logger: true
})

app.register(fjwt, { secret: String(JWT_SECRET) })
app.register(rabbitmq)

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
		await app.rabbitmq.subscribe(RabbitmqQueue.system, async message => {
			console.log(chalk.magenta(JSON.stringify(message)))
		})
	} catch (err) {
		app.log.error(err)
	}
})

const addSchemas = (schemas: JsonSchema[]) => schemas.forEach(schema => app.addSchema(schema))

const main = async () => {
	;[systemSchemas].forEach(addSchemas)
	app.register(systemRoutes, { prefix: '/system' })

	try {
		const host = process.env.ADDRESS || '0.0.0.0'
		const port = Number(process.env.PORT || 5000)

		await app.listen({ port, host })
		console.log(chalk.green.bgBlack(`Server listening on ${host}:${port}`))
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

main()
