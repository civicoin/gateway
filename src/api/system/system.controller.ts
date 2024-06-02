import { FastifyReply, FastifyRequest } from 'fastify'

import { app } from '../../app.js'
import { UserRole } from '../../types.js'
import { verifyPassword } from '../../auth/hash.js'
import { createSystem, findSystem } from './system.service.js'
import { CreateSystemInput, LoginSystemInput } from './system.schema.js'

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

export const loginSystemHandler = async (
	request: FastifyRequest<{ Body: LoginSystemInput }>,
	reply: FastifyReply
) => {
	const body = request.body

	try {
		const system = await findSystem({ name: body.name, select: { password: true } })
		if (!system || !system?.password) {
			return reply.code(404).send({
				message: 'System not found'
			})
		}

		const passwordVerified = await verifyPassword(body.password, system.password)
		if (!passwordVerified) {
			return reply.code(401).send({
				message: 'The password is incorrect'
			})
		}

		const toSign = { id: system.id, role: UserRole.ADMIN }

		return reply.code(200).send({ accessToken: app.jwt.sign(toSign) })
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
