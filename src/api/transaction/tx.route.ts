import { FastifyInstance } from 'fastify'

import { $ref } from './tx.schema.js'
import { sendTxHandler } from './tx.controller.js'

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
