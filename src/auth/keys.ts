import crypto from 'crypto'
import * as secp from '@noble/secp256k1'

// Sinle encryption with password
interface EncryptedData {
	encryptedPrivateKey: string
	iv: string
	salt: string
	authTag: string
}

// Encryption of encrypted private with secret
interface DoubleEncryptedData {
	encryptedPrivateKey: string
	innerIv: string
	innerSalt: string
	innerAuthTag: string
	outerIv: string
	outerAuthTag: string
}

const internalSecret = process.env.INTERNAL_SECRET || 'default-secret'

export const encryptPrivateWithPassword = (privateKey: string, password: string): EncryptedData => {
	const salt = crypto.randomBytes(16)
	const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
	const iv = crypto.randomBytes(12)
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

	const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()])
	const authTag = cipher.getAuthTag()

	return {
		encryptedPrivateKey: encrypted.toString('hex'),
		iv: iv.toString('hex'),
		salt: salt.toString('hex'),
		authTag: authTag.toString('hex')
	}
}

export const encryptEncryptedPrivateWithSecret = (
	encryptedData: EncryptedData
): DoubleEncryptedData => {
	const secretKey = crypto.createHash('sha256').update(internalSecret).digest()
	const iv = crypto.randomBytes(12)
	const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv)

	const encrypted = Buffer.concat([
		cipher.update(encryptedData.encryptedPrivateKey),
		cipher.final()
	])
	const authTag = cipher.getAuthTag()

	return {
		encryptedPrivateKey: encrypted.toString('hex'),
		innerIv: encryptedData.iv,
		innerSalt: encryptedData.salt,
		innerAuthTag: encryptedData.authTag,
		outerIv: iv.toString('hex'),
		outerAuthTag: authTag.toString('hex')
	}
}

export const decryptDoubleEncryptedPrivateWithSecret = (encryptedData: DoubleEncryptedData) => {
	const secretKey = crypto.createHash('sha256').update(internalSecret).digest()
	const decipher = crypto.createDecipheriv(
		'aes-256-gcm',
		secretKey,
		Buffer.from(encryptedData.outerIv, 'hex')
	)
	decipher.setAuthTag(Buffer.from(encryptedData.outerAuthTag, 'hex'))

	let decrypted = decipher.update(Buffer.from(encryptedData.encryptedPrivateKey, 'hex'))
	decrypted = Buffer.concat([decrypted, decipher.final()])

	return {
		encryptedPrivateKey: decrypted,
		iv: encryptedData.innerIv,
		salt: encryptedData.innerSalt,
		authTag: encryptedData.innerAuthTag
	}
}

export const generateKeys = () => {
	const privateKey = secp.utils.randomPrivateKey()
	const privateKeyHex = Buffer.from(privateKey).toString('hex')
	const publicKey = secp.getPublicKey(privateKey, true)

	return { privateKey: privateKeyHex, publicKey: Buffer.from(publicKey).toString('hex') }
}
