import { FastifyInstance } from 'fastify'

import { $ref } from './system.schema.js'
import { createSystemHandler } from './system.controller.js'

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
}

export default systemRoutes
