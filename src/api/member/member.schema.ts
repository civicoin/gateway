import { z } from 'zod'
import { MemberStatus } from '@prisma/client'
import { buildJsonSchemas } from 'fastify-zod'

import { withCreatedUpdated } from '../../utils/schema.js'
import { getZodCommonErrorObject } from '../../utils/schema.js'

const systemId = z.string(getZodCommonErrorObject('System ID')).uuid()

// enum MemberStatus {
// 	VALIDATING = 'VALIDATING',
// 	REJECTED = 'REJECTED',
// 	ACTIVE = 'ACTIVE',
// 	DELETED = 'DELETED'
// }
// MemberStatus

const memberCommonFields = {
	name: z.string(getZodCommonErrorObject('Name'))
}

const createMemberSchema = z.object({
	...memberCommonFields,
	systemId,
	password: z.string(getZodCommonErrorObject('Password'))
})

const createMemberResponseSchema = z.object(
	withCreatedUpdated({
		...memberCommonFields,
		id: z.string()
	})
)

const loginMemberSchema = z.object({
	name: z.string(getZodCommonErrorObject('Name')),
	systemId,
	password: z.string(getZodCommonErrorObject('Password'))
})

const loginMemberResponseSchema = z.object({
	accessToken: z.string()
})

const memberResponseSchema = z.object(
	withCreatedUpdated({
		...memberCommonFields,
		id: z.string(),
		status: z.nativeEnum(MemberStatus),
		system: z.object({
			id: z.string(),
			name: z.string()
		})
	})
)

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type LoginMemberInput = z.infer<typeof loginMemberSchema>

export const { schemas: memberSchemas, $ref } = buildJsonSchemas(
	{
		createMemberSchema,
		createMemberResponseSchema,
		loginMemberSchema,
		loginMemberResponseSchema,
		memberResponseSchema
	},
	{ $id: 'member' }
)
