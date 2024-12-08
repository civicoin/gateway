import BigNumber from 'bignumber.js'
import { FastifyRequest, FastifyReply } from 'fastify'

import { SendTxInput } from './tx.schema.js'
import { RabbitMQQueue } from '../../utils/rabbitmq.js'
import { getUserBalance } from '../balance/balance.service.js'

export const sendTxHandler = async (
	request: FastifyRequest<{ Body: SendTxInput }>,
	reply: FastifyReply
) => {
	const { receiverId, amount, signature } = request.body
	const { id: senderId, systemId } = request.user

	try {
		const balance = await getUserBalance(request)
		if (new BigNumber(balance).lessThan(new BigNumber(amount))) {
			return reply.code(400).send({
				error: 'INSUFFICIENT_BALANCE', // todo: make error object
				balance
			})
		}

		// set right queue for the appropriate core
		// todo: make type for the message (at shared civi)
		request.rabbitmqPublish(RabbitMQQueue.tx, {
			action: 'send',
			systemId,
			senderId,
			receiverId,
			amount,
			signature
		})

		return reply.code(200).send('Transaction has been sent')
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
