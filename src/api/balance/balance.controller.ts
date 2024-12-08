import { FastifyRequest, FastifyReply } from 'fastify'

import { getUserBalance } from './balance.service'

export const getBalance = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const balance = await getUserBalance(request)
		return balance
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
