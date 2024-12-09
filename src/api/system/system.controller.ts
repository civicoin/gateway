import { FastifyReply, FastifyRequest } from 'fastify'

import { app } from '../../app'
import { UserRole } from '../../types'
import { verifyPassword } from '../../auth/hash'
import { CreateSystemInput, LoginSystemInput } from './system.schema'
import { createSystem, findSystem, findSystems } from './system.service'

const notFoundReply = (reply: FastifyReply) =>
	reply.code(404).send({
		message: 'System not found'
	})

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
		if (!system || !system?.password) return notFoundReply(reply)

		const passwordVerified = await verifyPassword(body.password, system.password)
		if (!passwordVerified) {
			return reply.code(401).send({
				message: 'The password is incorrect'
			})
		}

		const toSign = { id: system.id, systemId: system.id, role: UserRole.ADMIN }

		return reply.code(200).send({ accessToken: app.jwt.sign(toSign) })
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getSystemHandler = async (
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply
) => {
	const { id } = request.params

	try {
		const system = await findSystem({ id })
		if (!system) return notFoundReply(reply)

		return reply.code(200).send(system)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getSystemsHandler = async (
	request: FastifyRequest<{ Querystring: { name: string; cursor?: string } }>,
	reply: FastifyReply
) => {
	const { name, cursor } = request.query

	try {
		const systems = await findSystems({ name, cursor })
		return reply.code(200).send(systems)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
