import { z } from 'zod'

export const getZodCommonErrorObject = (field: string, type?: string) => ({
	required_error: `${field} is required`,
	invalid_type_error: `${field} must be ${type}`
})

export const withCreatedUpdated = (schemaObject: object) => ({
	...schemaObject,
	created: z.string(),
	updated: z.string()
})
