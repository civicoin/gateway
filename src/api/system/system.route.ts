import { FastifyInstance } from 'fastify'

import { $ref } from './system.schema.js'
import { createSystemHandler, getSystemHandler, loginSystemHandler } from './system.controller.js'

const tags = ['System']

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
		'/:id',
		{
			schema: {
				description: 'Get system',
				summary: 'Get system',
				response: {
					200: $ref('systemResponseSchema')
				},
				tags
			}
		},
		getSystemHandler
	)
}

export default systemRoutes
