import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

import { getZodCommonErrorObject, withCreatedUpdated } from '../../utils/schema'

enum Restriction {
	PUBLIC = 'PUBLIC',
	PRIVATE = 'PRIVATE'
}

enum IssuanceType {
	LIMITED = 'LIMITED',
	UNLIMITED = 'UNLIMITED'
}

const systemCommonFields = {
	name: z.string(getZodCommonErrorObject('Name')),
	description: z.string(getZodCommonErrorObject('Description')).optional(),
	coin: z.string(getZodCommonErrorObject('Coin')),
	restriction: z.nativeEnum(Restriction),
	issuance: z.object({
		type: z.nativeEnum(IssuanceType),
		limit: z.number().optional()
	})
}

const createSystemSchema = z.object({
	...systemCommonFields,
	password: z.string(getZodCommonErrorObject('Password'))
})

const createSystemResponseSchema = z.object(
	withCreatedUpdated({
		...systemCommonFields,
		core: z.string(),
		id: z.string()
	})
)

const loginSystemSchema = z.object({
	name: z.string(getZodCommonErrorObject('Name')),
	password: z.string(getZodCommonErrorObject('Password'))
})

const loginSystemResponseSchema = z.object({
	accessToken: z.string()
})

const systemResponseSchema = z.object(withCreatedUpdated({ ...systemCommonFields, id: z.string() }))

export type CreateSystemInput = z.infer<typeof createSystemSchema>
export type LoginSystemInput = z.infer<typeof loginSystemSchema>

export const { schemas: systemSchemas, $ref } = buildJsonSchemas(
	{
		createSystemSchema,
		createSystemResponseSchema,
		loginSystemSchema,
		loginSystemResponseSchema,
		systemResponseSchema
	},
	{ $id: 'system' }
)
