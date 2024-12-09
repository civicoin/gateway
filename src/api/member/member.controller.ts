import { FastifyRequest, FastifyReply } from 'fastify'

import { app } from '../../app'
import { UserRole } from '../../types'
import { verifyPassword } from '../../auth/hash'
import { findSystem } from '../system/system.service'
import { CreateMemberInput, LoginMemberInput } from './member.schema'
import {
	createMember,
	findMember,
	findMembers,
	getMemberSecretEncryptedPrivateKey
} from './member.service.js'

const notFoundReply = (reply: FastifyReply) =>
	reply.code(404).send({
		message: 'Member not found'
	})

export const createMemberHandler = async (
	request: FastifyRequest<{ Body: CreateMemberInput }>,
	reply: FastifyReply
) => {
	const body = request.body

	try {
		const existing = await findMember({ name: body.name, systemId: body.systemId })
		if (existing) {
			return reply.code(409).send({
				statusCode: 409,
				message: 'Member already exists'
			})
		}

		const system = await findSystem({ id: body.systemId })
		if (!system) {
			return reply.code(404).send({
				message: 'System not found'
			})
		}

		const member = await createMember(body)

		return reply.code(201).send(member)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const loginMemberHandler = async (
	request: FastifyRequest<{ Body: LoginMemberInput }>,
	reply: FastifyReply
) => {
	const body = request.body

	try {
		const member = await findMember({
			name: body.name,
			systemId: body.systemId,
			select: { password: true }
		})
		if (!member || !member?.password) {
			return reply.code(404).send({
				message: 'Member not found'
			})
		}

		const passwordVerified = await verifyPassword(body.password, member.password)
		if (!passwordVerified) {
			return reply.code(401).send({
				message: 'The password is incorrect'
			})
		}

		const toSign = { id: member.id, systemId: member.systemId, role: UserRole.MEMBER }

		return reply.code(200).send({ accessToken: app.jwt.sign(toSign) })
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getMemberHandler = async (
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply
) => {
	const { systemId, id: memberId } = request.user
	let id = request.params.id

	try {
		if (id === 'me') {
			id = memberId
		}

		const member = await findMember({
			systemId,
			id
		})
		if (!member) {
			return notFoundReply(reply)
		}

		return reply.code(200).send(member)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getMembersHandler = async (
	request: FastifyRequest<{ Querystring: { name: string; cursor?: string } }>,
	reply: FastifyReply
) => {
	const systemId = request.user.systemId
	const { name, cursor } = request.query

	try {
		const members = await findMembers({
			systemId,
			name,
			cursor
		})

		return reply.code(200).send(members)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getMemberPrivateKeyHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.user

	try {
		const privateKeyData = await getMemberSecretEncryptedPrivateKey(id)
		return reply.code(200).send(privateKeyData)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
