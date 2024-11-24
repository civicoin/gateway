import { FastifyRequest, FastifyReply } from 'fastify'

import { SendTxInput } from './tx.schema.js'

export const sendTxHandler = async (
	request: FastifyRequest<{ Body: SendTxInput }>,
	reply: FastifyReply
) => {
	const body = request.body
	const user = request.user

	try {
		console.log(body, user)

		// 1. validate tx
		// 2. choose the right core for the systen
		// 3. send tx to the core query
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
