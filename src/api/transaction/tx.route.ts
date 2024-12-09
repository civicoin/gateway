import { FastifyInstance } from 'fastify'

import { $ref } from './tx.schema'
import { issueTxHandler, sendTxHandler } from './tx.controller'

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
	app.post(
		'/issue',
		{
			preHandler: [app.authenticate, app.admin, app.core],
			schema: {
				description: 'Issue coins to a member',
				summary: 'Issue coins to a member',
				body: $ref('issueTxSchema'),
				tags,
				security: [
					{
						Bearer: []
					}
				]
			}
		},
		issueTxHandler
	)
}

export default txRoutes
