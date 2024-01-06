import { JWT } from '@fastify/jwt'

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT
	}
	export interface FastifyInstance {
		authenticate: unknown
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
