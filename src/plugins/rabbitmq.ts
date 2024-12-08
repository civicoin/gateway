import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { safeJsonParse } from '../utils/data.js'
import RabbitMQClient, { RabbitMQQueue } from '../utils/rabbitmq.js'
import { getMessageWithHMAC, verifyMessageWithHMAC } from '../auth/hmac.js'

const rabbitmq = async (fastify: FastifyInstance) => {
	try {
		const client = RabbitMQClient.getInstance(fastify.log)
		const channel = await client.getChannel()

		fastify.decorate('rabbitmq', {
			publish: async (queue: RabbitMQQueue, message: object) => {
				await channel.assertQueue(queue, { durable: false })
				const messageWithHMAC = getMessageWithHMAC(message)

				channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageWithHMAC)))
			},
			subscribe: async (queue: RabbitMQQueue, callback: (message: object) => void) => {
				await channel.assertQueue(queue, { durable: false })
				await channel.consume(queue, message => {
					if (!message) return
					const parsedMessage = safeJsonParse(message.content.toString())

					if (verifyMessageWithHMAC(parsedMessage)) {
						callback(parsedMessage)
					} else {
						fastify.log.error('RabbitMQ Consume: Invalid HMAC', parsedMessage)
					}

					channel.ack(message)
				})
			}
		})

		fastify.decorateRequest(
			'rabbitmqPublish',
			async (queue: RabbitMQQueue, message: object) => {
				await fastify.rabbitmq.publish(queue, message)
			}
		)
	} catch (err) {
		fastify.log.error('RabbitMQ error', err)
	}
}

export default fastifyPlugin(rabbitmq)
