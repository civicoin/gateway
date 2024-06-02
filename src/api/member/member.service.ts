import { Member, MemberStatus } from '@prisma/client'

import prisma from '../../utils/prisma.js'
import { hashPassword } from '../../auth/hash.js'
import { CreateMemberInput } from './member.schema.js'

const compulsoryFieldsToSelect = {
	id: true,
	name: true,
	systemId: true
}

export const defaultMemberFieldsToSelect = {
	...compulsoryFieldsToSelect,
	created: true,
	updated: true
}

type FindMemberInput = (Partial<{ name: string; id: string }> &
	({ name: string } | { id: string })) & { select?: object } & { systemId: string }

export const findMember = async ({
	name,
	id,
	systemId,
	select = defaultMemberFieldsToSelect
}: FindMemberInput): Promise<Partial<Member | null>> => {
	return await prisma.member.findFirst({
		where: {
			...(name && { name }),
			...(id && { id }),
			systemId
		},
		select: { ...compulsoryFieldsToSelect, ...select }
	})
}

export const createMember = async (input: CreateMemberInput) => {
	const { password } = input
	const hashedPassword = await hashPassword(password, 10)

	const member = await prisma.member.create({
		data: {
			...input,
			status: MemberStatus.ACTIVE,
			password: hashedPassword
		},
		select: defaultMemberFieldsToSelect
	})

	return member
}
