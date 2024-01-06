import bcrypt from 'bcrypt'

export const hashPassword = async (password: string, saltRounds: number = 3) =>
	await bcrypt.hash(password, saltRounds)

export const verifyPassword = async (password: string, hashedPassword?: string) =>
	hashedPassword && (await bcrypt.compare(password, hashedPassword))
