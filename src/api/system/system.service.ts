import { Core, System, SystemStatus } from '@prisma/client'

import prisma from '../../utils/prisma'
import { hashPassword } from '../../auth/hash'
import { CreateSystemInput } from './system.schema'
import { CursorBasedPagination, getPrismaOffsetPaginationArgs } from './../../utils/pagination'

const compulsoryFieldsToSelect = {
	id: true,
	name: true
}

const defaultSystemFieldsToSelect = {
	...compulsoryFieldsToSelect,
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
	select = defaultSystemFieldsToSelect
}: FindSystemInput): Promise<Partial<System | null>> => {
	return await prisma.system.findFirst({
		where: {
			...(name && { name }),
			...(id && { id })
		},
		select: { ...compulsoryFieldsToSelect, ...select }
	})
}

type FindSystemsInput = {
	name: string
} & CursorBasedPagination

export const findSystems = async ({ name, pageSize = 10, cursor }: FindSystemsInput) => {
	return await prisma.system.findMany({
		...getPrismaOffsetPaginationArgs(cursor, pageSize),
		where: {
			name: { contains: name, mode: 'insensitive' }
		},
		select: defaultSystemFieldsToSelect,
		orderBy: {
			id: 'asc'
		}
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
		select: defaultSystemFieldsToSelect
	})

	return system
}
