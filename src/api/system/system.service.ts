import prisma from '../../utils/prisma.js'
import { hashPassword } from '../../auth/hash.js'
import { CreateSystemInput } from './system.schema.js'
import { Core, System, SystemStatus } from '@prisma/client'

const compulsoryFieldsToSelect = {
	id: true,
	name: true
}

const defaultFieldsToSelect = {
	description: true,
	coin: true,
	restriction: true,
	issuance: true,
	core: true,
	created: true,
	updated: true
}

type FindSystemInput = (Partial<{ name: string; id: string }> &
	({ name: string } | { id: string })) & { select?: object }

export const findSystem = async ({
	name,
	id,
	select = defaultFieldsToSelect
}: FindSystemInput): Promise<Partial<System | null>> => {
	return await prisma.system.findFirst({
		where: {
			...(name && { name }),
			...(id && { id })
		},
		select: { ...compulsoryFieldsToSelect, ...select }
	})
}

export const createSystem = async (input: CreateSystemInput) => {
	const { password } = input
	const hashedPassword = await hashPassword(password, 10)

	const system = await prisma.system.create({
		data: {
			...input,
			core: Core.CORE,
			status: SystemStatus.ACTIVE,
			password: hashedPassword
		},
		select: defaultFieldsToSelect
	})

	return system
}
