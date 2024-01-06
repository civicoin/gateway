import { FastifyReply, FastifyRequest } from 'fastify'

import { CreateSystemInput } from './system.schema.js'
import { createSystem, findSystem } from './system.service.js'

export const createSystemHandler = async (
	request: FastifyRequest<{ Body: CreateSystemInput }>,
	reply: FastifyReply
) => {
	const body = request.body

	try {
		const existing = await findSystem({ name: body.name })
		if (existing) {
			return reply.code(409).send({
				statusCode: 409,
				message: 'System already exists'
			})
		}

		const system = await createSystem(body)

		return reply.code(201).send(system)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
