import { FastifyInstance } from 'fastify'

import { $ref } from './system.schema.js'
import { createSystemHandler, loginSystemHandler } from './system.controller.js'

const systemRoutes = async (app: FastifyInstance) => {
	app.post(
		'/',
		{
			schema: {
				description: 'Create a new system',
				summary: 'Create a new system',
				body: $ref('createSystemSchema'),
				response: {
					201: $ref('createSystemResponseSchema')
				}
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
				}
			}
		},
		loginSystemHandler
	)
}

export default systemRoutes
