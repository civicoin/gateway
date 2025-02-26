import { FastifyRequest } from 'fastify'

import { GetBalanceRequest, GetBalanceResponse } from '../../generated/core'

export const getUserBalance = async (request: FastifyRequest) => {
	const systemId = request.user.systemId
	const userId = request.user.id

	const req: GetBalanceRequest = {
		systemId,
		memberId: userId
	}

	const res = await new Promise<GetBalanceResponse>((resolve, reject) => {
		request.core.getBalance(req, (err, res) => {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})

	return res.balance
}
