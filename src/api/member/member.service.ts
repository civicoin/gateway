import prisma from '../../utils/prisma'
import { hashPassword } from '../../auth/hash'
import { Member, MemberStatus } from '../../db'
import { CreateMemberInput } from './member.schema'
import { CursorBasedPagination, getPrismaOffsetPaginationArgs } from '../../utils/pagination'
import {
	decryptDoubleEncryptedPrivateWithSecret,
	encryptEncryptedPrivateWithSecret,
	encryptPrivateWithPassword,
	generateKeys
} from '../../auth/keys'

const compulsoryFieldsToSelect = {
	id: true,
	name: true,
	systemId: true,
	status: true
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

type FindMembers = { name: string; systemId: string } & CursorBasedPagination

export const findMembers = async ({ name, systemId, cursor }: FindMembers) => {
	return await prisma.member.findMany({
		...getPrismaOffsetPaginationArgs(cursor, 10),
		where: {
			name: { contains: name, mode: 'insensitive' },
			systemId
		},
		select: defaultMemberFieldsToSelect,
		orderBy: {
			id: 'asc'
		}
	})
}

export const createMember = async (input: CreateMemberInput) => {
	const { password } = input
	const hashedPassword = await hashPassword(password, 10)

	const { privateKey, publicKey } = generateKeys()

	const passwordEncryptedPrivateKeyData = encryptPrivateWithPassword(privateKey, password)
	const secretPasswordEncryptedPrivateKeyData = encryptEncryptedPrivateWithSecret(
		passwordEncryptedPrivateKeyData
	)

	const member = await prisma.member.create({
		data: {
			...input,
			publicKey,
			status: MemberStatus.ACTIVE,
			password: hashedPassword
		},
		select: defaultMemberFieldsToSelect
	})

	await prisma.memberPrivateKey.create({
		data: {
			memberId: member.id,
			...secretPasswordEncryptedPrivateKeyData
		}
	})

	return member
}

export const getMemberSecretEncryptedPrivateKey = async (id: string) => {
	const memberPrivateKeyData = await prisma.memberPrivateKey.findFirst({
		where: { memberId: id }
	})
	if (!memberPrivateKeyData) {
		return null
	}

	return decryptDoubleEncryptedPrivateWithSecret(memberPrivateKeyData)
}
