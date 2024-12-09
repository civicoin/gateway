import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const commonTxSchema = {
	receiverId: z.string(),
	amount: z.string(),
	signature: z.string()
}

const sendTxSchema = z.object({
	...commonTxSchema
})

export type SendTxInput = z.infer<typeof sendTxSchema>

const issueTxSchema = z.object({
	...commonTxSchema
})

export type IssueTxInput = z.infer<typeof issueTxSchema>

export const { schemas: txSchemas, $ref } = buildJsonSchemas(
	{
		sendTxSchema,
		issueTxSchema
	},
	{ $id: 'tx' }
)
