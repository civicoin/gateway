import { FastifyInstance } from 'fastify'

import { $ref } from './member.schema.js'
import {
	createMemberHandler,
	getMemberHandler,
	getMemberPrivateKeyHandler,
	loginMemberHandler
} from './member.controller.js'

const tags = ['Member']

const memberRoutes = async (app: FastifyInstance) => {
	app.post(
		'/',
		{
			schema: {
				description: 'Create a new member',
				summary: 'Create a new member',
				body: $ref('createMemberSchema'),
				response: {
					201: $ref('createMemberResponseSchema')
				},
				tags
			}
		},
		createMemberHandler
	)
	app.post(
		'/login',
		{
			schema: {
				description: 'Login to a member',
				summary: 'Login to a member',
				body: $ref('loginMemberSchema'),
				response: {
					200: $ref('loginMemberResponseSchema')
				},
				tags
			}
		},
		loginMemberHandler
	)
	app.get(
		'/private',
		{
			preHandler: [app.authenticate],
			schema: {
				description: 'Get member private key',
				summary: 'Get member private key',
				response: {
					200: {
						type: 'object',
						properties: {
							encryptedPrivateKey: { type: 'string' },
							iv: { type: 'string' },
							salt: { type: 'string' },
							authTag: { type: 'string' }
						}
					}
				},
				tags
			}
		},
		getMemberPrivateKeyHandler
	)
	app.get(
		'/:find',
		{
			schema: {
				description: 'Get member of authed system',
				summary: 'Get member of authed system',
				response: {
					200: $ref('memberResponseSchema')
				},
				tags
			}
		},
		getMemberHandler
	)
	// response: {
	//     200: {
	//         type: 'array',
	//         items: $ref('memberResponseSchema')
	//     }
	// },
}

export default memberRoutes
