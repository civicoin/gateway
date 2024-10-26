import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const sendTxSchema = z.object({
	receiverId: z.string(),
	amount: z.string(),
	signature: z.string()
})

export type SendTxInput = z.infer<typeof sendTxSchema>

export const { schemas: txSchemas, $ref } = buildJsonSchemas(
	{
		sendTxSchema
	},
	{ $id: 'tx' }
)
