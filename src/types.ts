import { JWT } from '@fastify/jwt'

import { RabbitMQQueue } from './utils/rabbitmq.js'

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT
	}

	export interface FastifyInstance {
		authenticate: unknown
		rabbitmq: {
			publish: (queue: RabbitMQQueue, message: object) => Promise<void>
			subscribe: (queue: RabbitMQQueue, callback: (message: object) => void) => Promise<void>
		}
	}
}

interface CommonUserPayload {
	id: string
}

interface MemberPayload extends CommonUserPayload {
	role: 'member'
}

interface AdminPayload extends CommonUserPayload {
	role: 'admin'
}

type UserPayload = MemberPayload | AdminPayload

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: UserPayload
	}
}
