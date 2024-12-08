import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const balanceResponseSchema = z.string()

export const { schemas: balanceSchemas, $ref } = buildJsonSchemas(
	{
		balanceResponseSchema
	},
	{ $id: 'balance' }
)
