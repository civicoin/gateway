import { RouteGenericInterface } from 'fastify'

import type { CoreClient } from './generated/core_grpc_pb.d.ts'

import { RabbitMQQueue } from './utils/rabbitmq.js'
import { GRPCCoreClients } from './plugins/grpcClient.js'

declare module 'fastify' {
	interface FastifyRequest {
		user: UserPayload
		core: CoreClient // change to general
		rabbitmqPublish: (queue: RabbitMQQueue, message: object) => Promise<void>
	}

	export interface FastifyInstance {
		authenticate: <T extends RouteGenericInterface = RouteGenericInterface>(
			request: FastifyRequest<T>,
			reply: FastifyReply
		) => Promise<void>
		core: <T extends RouteGenericInterface = RouteGenericInterface>(
			request: FastifyRequest<T>,
			reply: FastifyReply
		) => Promise<void>
		rabbitmq: {
			publish: (queue: RabbitMQQueue, message: object) => Promise<void>
			subscribe: (queue: RabbitMQQueue, callback: (message: object) => void) => Promise<void>
		}
		grpc: {
			coreClients: GRPCCoreClients
		}
	}
}

export enum UserRole {
	MEMBER = 'member',
	ADMIN = 'admin'
}

interface CommonUserPayload {
	id: string
	systemId: string
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
