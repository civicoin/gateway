import { FastifyRequest, FastifyReply } from 'fastify'

import { app } from '../../app.js'
import { UserRole } from '../../types.js'
import { verifyPassword } from '../../auth/hash.js'
import { findSystem } from '../system/system.service.js'
import { CreateMemberInput, LoginMemberInput } from './member.schema.js'
import {
	createMember,
	defaultMemberFieldsToSelect,
	findMember,
	getMemberSecretEncryptedPrivateKey
} from './member.service.js'

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

		const toSign = { id: member.id, role: UserRole.MEMBER }

		return reply.code(200).send({ accessToken: app.jwt.sign(toSign) })
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getMemberHandler = async (
	request: FastifyRequest<{ Params: { find: string }; Querystring: { findBy: string } }>,
	reply: FastifyReply
) => {
	const systemId = '343da486-a6fa-44cd-b3e3-491018d30b52'
	// const { findBy } = request.query
	const { find } = request.params

	try {
		const member = await findMember({
			systemId,
			name: find,
			select: {
				...defaultMemberFieldsToSelect,
				status: true,
				system: {
					select: {
						id: true,
						name: true
					}
				}
			}
		})
		if (!member) {
			return reply.code(404).send({
				message: 'Member not found'
			})
		}

		return reply.code(200).send(member)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}

export const getMemberPrivateKeyHandler = async (
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply
) => {
	const { id } = request.params

	try {
		const privateKeyData = await getMemberSecretEncryptedPrivateKey(id)
		console.log(privateKeyData)

		return reply.code(200).send(privateKeyData)
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
