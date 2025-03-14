import { FastifyInstance } from 'fastify'

import { $ref } from './member.schema'
import {
	createMemberHandler,
	getMemberHandler,
	getMemberPrivateKeyHandler,
	getMembersHandler,
	loginMemberHandler
} from './member.controller'

const tags = ['Member']

const memberRoutes = async (app: FastifyInstance) => {
	app.post(
		'',
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
				security: [
					{
						Bearer: []
					}
				],
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
		'/members',
		{
			preHandler: [app.authenticate],
			schema: {
				description: 'Find members by name',
				summary: 'Get members',
				querystring: {
					type: 'object',
					properties: {
						name: { type: 'string' }
					}
				},
				security: [
					{
						Bearer: []
					}
				],
				response: {
					200: {
						type: 'array',
						items: $ref('memberResponseSchema')
					}
				},
				tags
			}
		},
		getMembersHandler
	)
	app.get(
		'/:id',
		{
			preHandler: [app.authenticate],
			schema: {
				description: 'Get member of authed system',
				summary: 'Get member of authed system',
				response: {
					200: $ref('memberResponseSchema')
				},
				security: [
					{
						Bearer: []
					}
				],
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
