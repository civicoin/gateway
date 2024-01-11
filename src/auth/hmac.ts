import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

const key = process.env.HMAC_SECRET
if (!key) {
	throw new Error('Missing HMAC secret')
}

const hmac = (message: object) =>
	crypto.createHmac('sha256', key).update(JSON.stringify(message)).digest('hex')

export const getMessageWithHMAC = (message: object) => ({
	hmac: hmac(message),
	...message
})

export const verifyMessageWithHMAC = (message: { hmac?: string }) => {
	if (!message.hmac) return false
	const { hmac: messageHMAC, ...rest } = message
	return messageHMAC === hmac(rest)
}

export default hmac
