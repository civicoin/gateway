import BigNumber from 'bignumber.js'
import { FastifyRequest, FastifyReply } from 'fastify'

import { IssuanceType } from '../../db'
import { RabbitMQQueue } from '../../utils/rabbitmq'
import { findMember } from '../member/member.service'
import { findSystem } from '../system/system.service'
import { IssueTxInput, SendTxInput } from './tx.schema'
import { getUserBalance } from '../balance/balance.service'

export const sendTxHandler = async (
	request: FastifyRequest<{ Body: SendTxInput }>,
	reply: FastifyReply
) => {
	const { receiverId, amount, signature } = request.body
	const { id: senderId, systemId } = request.user

	try {
		const balance = await getUserBalance(request)
		if (new BigNumber(balance).lessThan(amount)) {
			return reply.code(400).send({
				error: 'INSUFFICIENT_BALANCE', // todo: make error object
				balance
			})
		}

		const receiver = await findMember({ systemId, id: receiverId })
		if (!receiver) {
			return reply.code(404).send({
				error: 'RECEIVER_NOT_FOUND'
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

export const issueTxHandler = async (
	request: FastifyRequest<{ Body: IssueTxInput }>,
	reply: FastifyReply
) => {
	const { id } = request.user
	const { receiverId, amount, signature } = request.body

	try {
		const system = await findSystem({ id })
		if (!system) {
			throw new Error(`System ${id} not found`)
		}

		const issuance = system.issuance
		const type = issuance?.type || IssuanceType.UNLIMITED
		// const limit = issuance?.limit || 0

		if (type !== IssuanceType.UNLIMITED) {
			throw new Error('Issuance type is not supported')
		}

		// set right queue for the appropriate core
		request.rabbitmqPublish(RabbitMQQueue.tx, {
			action: 'issue',
			systemId: id,
			receiverId,
			amount,
			signature
		})
	} catch (err) {
		request.log.error(err)
		return reply.code(500).send(err)
	}
}
