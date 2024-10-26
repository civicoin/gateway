import { RabbitMQQueue } from './utils/rabbitmq.js'

declare module 'fastify' {
	interface FastifyRequest {
		user: UserPayload
	}

	export interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
		rabbitmq: {
			publish: (queue: RabbitMQQueue, message: object) => Promise<void>
			subscribe: (queue: RabbitMQQueue, callback: (message: object) => void) => Promise<void>
		}
		grpc: {
			core: unknown
		}
	}
}

export enum UserRole {
	MEMBER = 'member',
	ADMIN = 'admin'
}

interface CommonUserPayload {
	id: string
}

interface MemberPayload extends CommonUserPayload {
	role: UserRole.MEMBER
}

interface AdminPayload extends CommonUserPayload {
	role: UserRole.ADMIN
}

export type UserPayload = MemberPayload | AdminPayload

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: UserPayload
	}
}
