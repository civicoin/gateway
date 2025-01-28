import { FastifyInstance } from 'fastify'

import { $ref } from './system.schema'
import {
	createSystemHandler,
	getMySystemHandler,
	getPublicSystemHandler,
	getSystemsHandler,
	loginSystemHandler
} from './system.controller'

const tags = ['System']

const systemRoutes = async (app: FastifyInstance) => {
	app.post(
		'',
		{
			schema: {
				description: 'Create a new system',
				summary: 'Create a new system',
				body: $ref('createSystemSchema'),
				response: {
					201: $ref('createSystemResponseSchema')
				},
				tags
			}
		},
		createSystemHandler
	)

	app.post(
		'/login',
		{
			schema: {
				description: 'Login to a system',
				summary: 'Login to a system',
				body: $ref('loginSystemSchema'),
				response: {
					200: $ref('loginSystemResponseSchema')
				},
				tags
			}
		},
		loginSystemHandler
	)

	app.get(
		'/systems',
		{
			schema: {
				description: 'Find systems by name',
				summary: 'Get systems',
				querystring: {
					type: 'object',
					properties: {
						name: { type: 'string' }
					}
				},
				response: {
					200: {
						type: 'array',
						items: $ref('systemResponseSchema')
					}
				},
				tags
			}
		},
		getSystemsHandler
	)

	app.get(
		'/me',
		{
			preHandler: [app.authenticate],
			schema: {
				description: 'Get my system info',
				summary: 'Get my system info',
				security: [
					{
						Bearer: []
					}
				],
				response: {
					200: $ref('systemResponseSchema')
				},
				tags
			}
		},
		getMySystemHandler
	)

	app.get(
		'/:id',
		{
			schema: {
				description: 'Get public info of the system',
				summary: 'Get public info of the system',
				response: {
					200: $ref('systemResponseSchema')
				},
				tags
			}
		},
		getPublicSystemHandler
	)
}

export default systemRoutes
