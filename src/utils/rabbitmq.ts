import { FastifyBaseLogger } from 'fastify'
import amqp, { Connection, Channel } from 'amqplib'

export enum RabbitMQQueue {
	system = 'system'
}

class RabbitMQClient {
	private static instance: RabbitMQClient
	private logger: FastifyBaseLogger | null = null
	private readonly url: string = process.env.RABBITMQ_URL || 'amqp://localhost'

	private channel: Channel | null = null
	private connection: Connection | null = null

	private constructor() {}

	public static getInstance(logger?: FastifyBaseLogger): RabbitMQClient {
		if (!RabbitMQClient.instance) {
			RabbitMQClient.instance = new RabbitMQClient()
		}

		if (logger) {
			RabbitMQClient.instance.logger = logger
		}

		return RabbitMQClient.instance
	}

	private resetConnection() {
		this.channel = null
		this.connection = null
	}

	public async getConnection(): Promise<Connection> {
		if (!this.connection) {
			this.connection = await amqp.connect(this.url)

			this.connection.on('close', () => {
				this.logger?.info('RabbitMQ connection closed')
				this.resetConnection()
			})

			this.connection.on('error', err => {
				this.logger?.error(err, 'RabbitMQ connection error')
				this.resetConnection()
			})
		}

		return this.connection
	}

	public async getChannel(): Promise<Channel> {
		if (!this.channel) {
			const connection = await this.getConnection()
			this.channel = await connection.createChannel()
		}

		return this.channel
	}
}

export default RabbitMQClient
