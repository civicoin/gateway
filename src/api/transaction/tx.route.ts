import { FastifyInstance } from 'fastify'

import { $ref } from './tx.schema'
import { sendTxHandler } from './tx.controller'

const tags = ['Transaction']

const txRoutes = async (app: FastifyInstance) => {
	app.post(
		'/send',
		{
			preHandler: [app.authenticate, app.core],
			schema: {
				description: 'Send coins to another member',
				summary: 'Send coins to another member',
				body: $ref('sendTxSchema'),
				tags,
				security: [
					{
						Bearer: []
					}
				]
			}
		},
		sendTxHandler
	)
}

export default txRoutes
