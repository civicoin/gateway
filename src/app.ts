import chalk from 'chalk'
import dotenv from 'dotenv'
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

dotenv.config()

const JWT_SECRET = process.env.SECRET
if (![JWT_SECRET].every(Boolean)) {
	throw new Error('Missing necessary environment variables')
}

const app = fastify({ logger: true })

app.register(fjwt, { secret: String(JWT_SECRET) })

app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
	try {
		const token = ''
		const decoded = req.jwt.verify<FastifyJWT['user']>(token)

		req.user = decoded
	} catch (err) {
		return reply.send(err)
	}
})

const main = async () => {
	try {
		const host = process.env.ADDRESS || '0.0.0.0'
		const port = Number(process.env.PORT || 5000)

		await app.listen({ port, host })
		console.log(chalk.green(`Server listening on ${host}:${port}`))
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

main()
