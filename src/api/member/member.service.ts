import { Member, MemberStatus } from '@prisma/client'

import prisma from '../../utils/prisma.js'
import { hashPassword } from '../../auth/hash.js'
import { CreateMemberInput } from './member.schema.js'
import {
	decryptDoubleEncryptedPrivateWithSecret,
	encryptEncryptedPrivateWithSecret,
	encryptPrivateWithPassword,
	generateKeys
} from '../../auth/keys.js'

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
