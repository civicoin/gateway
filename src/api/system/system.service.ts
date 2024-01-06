import prisma from '../../utils/prisma.js'
import { hashPassword } from '../../utils/hash.js'
import { CreateSystemInput } from './system.schema.js'

const fieldsToSelect = {
	id: true,
	name: true,
	description: true,
	coin: true,
	restriction: true,
	issuance: true,
	core: true,
	created: true,
	updated: true
}

export const findSystem = async ({
	name,
	id
}: Partial<{ name: string; id: string }> & ({ name: string } | { id: string })) => {
	return await prisma.system.findFirst({
		where: {
			...(name && { name }),
			...(id && { id })
		},
		select: fieldsToSelect
	})
}

export const createSystem = async (input: CreateSystemInput) => {
	const { password } = input
	const hashedPassword = await hashPassword(password, 10)

	const system = await prisma.system.create({
		data: {
			...input,
			core: 'CORE',
			status: 'ACTIVE',
			password: hashedPassword
		},
		select: fieldsToSelect
	})

	return system
}
