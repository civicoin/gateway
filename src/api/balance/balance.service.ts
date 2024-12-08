import { createRequire } from 'module'
import { FastifyRequest } from 'fastify'

import { GetBalanceResponse } from '../../generated/core_pb'

const require = createRequire(import.meta.url)
const { GetBalanceRequest } = require('../../generated/core_pb')

export const getUserBalance = async (request: FastifyRequest) => {
	const systemId = request.user.systemId
	const userId = request.user.id

	const req = new GetBalanceRequest()
	req.setSystemid(systemId)
	req.setMemberid(userId)

	const res = await new Promise<GetBalanceResponse>((resolve, reject) => {
		request.core.getBalance(req, (error, response) => {
			if (error) return reject(error)
			resolve(response)
		})
	})

	return res.getBalance()
}
