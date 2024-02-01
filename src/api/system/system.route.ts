import { FastifyInstance } from 'fastify'

import { $ref } from './system.schema.js'
import { createSystemHandler, loginSystemHandler } from './system.controller.js'

const systemRoutes = async (app: FastifyInstance) => {
	app.post(
		'/',
		{
			schema: {
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
