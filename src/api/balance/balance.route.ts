import { FastifyInstance } from 'fastify'

import { $ref } from './balance.schema.js'
import { getBalance } from './balance.controller.js'

const tags = ['Balance']

const balanceRoutes = async (app: FastifyInstance) => {
	app.get(
		'/',
		{
			preHandler: [app.core],
			schema: {
				description: 'Get the balance of the current user',
				summary: 'Get the balance of the current user',
				response: {
					200: $ref('balanceResponseSchema')
				},
				tags
			}
		},
		getBalance
	)
}

export default balanceRoutes
