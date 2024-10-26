import { getPublicKey } from '@noble/secp256k1'

async function deriveKeyFromPassword(password: string, salt: string) {
	const enc = new TextEncoder()
	const passwordKey = await crypto.subtle.importKey(
		'raw',
		enc.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	)

	const derivedKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: Buffer.from(salt, 'hex'),
			iterations: 100000,
			hash: 'SHA-256'
		},
		passwordKey,
		{
			name: 'AES-GCM',
			length: 256
		},
		false,
		['decrypt']
	)

	return derivedKey
}

async function decryptPrivateKey(
	derivedKey: CryptoKey,
	encryptedData: string,
	iv: string,
	authTag: string
) {
	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: Buffer.from(iv, 'hex'),
			additionalData: undefined,
			tagLength: 128
		},
		derivedKey,
		Buffer.from(encryptedData + authTag, 'hex')
	)

	const dec = new TextDecoder()
	return dec.decode(decrypted)
}

async function decryptClientSide(
	encryptedData: string,
	iv: string,
	salt: string,
	authTag: string,
	password: string
) {
	try {
		const derivedKey = await deriveKeyFromPassword(password, salt)
		const privateKey = await decryptPrivateKey(derivedKey, encryptedData, iv, authTag)

		return privateKey
	} catch (error) {
		console.error('Decryption failed:', error)
	}
}

// here is the result from localhost:5000/member/private for c425a176-755a-494b-b5ff-036412e9f823
export const checkDecrypt = async () => {
	const res = await decryptClientSide(
		'937cdafd34a742a75a77a818e82983a39b9c6f165327994bba8c977eef5abe9c224f5a60c264134ff2acab8aea5f8d871a1c1e9db9d90538ac230a1843f8d428',
		'bacfd508b4d21863236c0298',
		'06e6ea3e786400df32d5784210a11a2b',
		'68516ff0d2f77135c1bfb2d15056c9a2',
		'string' // password
	)

	console.log('Decrypted private: ', res)
	console.log(
		'Public from it: ',
		Array.from(
			getPublicKey('11671859c69797615a98a162879741b670ec92ae890b26fb63cbea33b8bfc957', true),
			byte => byte.toString(16).padStart(2, '0')
		).join('')
	)
}

// private: 11671859c69797615a98a162879741b670ec92ae890b26fb63cbea33b8bfc957
// public: 0250329c296871f22954036b7186e03dbf31686b70f15db1503ff2e72801123576
