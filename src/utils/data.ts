import { logger } from '../server.js'

export const safeJsonParse = (message: string): object => {
	try {
		return JSON.parse(message)
	} catch {
		logger.error('JSON Parse: Invalid JSON', message)
		return {}
	}
}
