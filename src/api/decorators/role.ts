import { FastifyReply, FastifyRequest } from 'fastify'

import { UserRole } from '../../types'

export const checkRole = (req: FastifyRequest, reply: FastifyReply, expectedRole: UserRole) => {
	try {
		const { role } = req.user
		if (role !== expectedRole) {
			return reply.code(403).send({
				message: 'Forbidden'
			})
		}
	} catch (err) {
		return reply.send(err)
	}
}
