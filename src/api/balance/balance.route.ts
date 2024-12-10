import { FastifyInstance } from 'fastify'

import { $ref } from './balance.schema'
import { getBalance } from './balance.controller'

const tags = ['Balance']

const balanceRoutes = async (app: FastifyInstance) => {
	app.get(
		'',
		{
			preHandler: [app.authenticate, app.core],
			schema: {
				description: 'Get the balance of the current user',
				summary: 'Get the balance of the current user',
				response: {
					200: $ref('balanceResponseSchema')
				},
				tags,
				security: [
					{
						Bearer: []
					}
				]
			}
		},
		getBalance
	)
}

export default balanceRoutes
