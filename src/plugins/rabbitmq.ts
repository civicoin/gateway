import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import RabbitMQClient, { RabbitmqQueue } from '../utils/rabbitmq.js'

const tryJsonParse = (message: string): object => {
	try {
		return JSON.parse(message)
	} catch {
		return {}
	}
}

const rabbitmq = async (fastify: FastifyInstance) => {
	try {
		const client = RabbitMQClient.getInstance(fastify.log)
		const channel = await client.getChannel()

		fastify.decorate('rabbitmq', {
			publish: async (queue: RabbitmqQueue, message: object) => {
				await channel.assertQueue(queue, { durable: false })
				channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
			},
			subscribe: async (queue: RabbitmqQueue, callback: (message: object) => void) => {
				await channel.assertQueue(queue, { durable: false })
				await channel.consume(queue, message => {
					if (!message) return

					callback(tryJsonParse(message.content.toString()))
					channel.ack(message)
				})
			}
		})
	} catch (err) {
		fastify.log.error('RabbitMQ error', err)
	}
}

export default fastifyPlugin(rabbitmq)
