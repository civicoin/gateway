import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import type { ICoreClient } from '../generated/core_grpc_pb.d.ts'

import createGrpcClient from '../utils/grpcClientFactory.js'

export enum GRPCCoreService {
	CORE = 'Core'
}

export type GRPCCoreClients = {
	[GRPCCoreService.CORE]: ICoreClient
}

const coreServices = [
	{
		// internalName: 'core1',
		name: GRPCCoreService.CORE,
		protoFile: 'core.proto',
		address: process.env.CORE_GRPC_URL ?? ''
	}
]

const grpcClients = async (fastify: FastifyInstance) => {
	try {
		const coreClients = coreServices.reduce((clients, service) => {
			clients[service.name] = createGrpcClient<ICoreClient>(
				service.name,
				service.protoFile,
				service.address
			)
			return clients
		}, {} as GRPCCoreClients)

		// TODO: TEMPORARY check if the client is working
		coreClients.Core.getBalance(
			{
				systemId: '9d77f542-cee0-4625-8c36-62d378ad699d',
				memberId: '54ea1230-8275-401f-8236-a6f2cb69015e'
			},
			(err, res) => {
				console.log(err, res)
			}
		)

		fastify.decorate('grpc', {
			coreClients
		})
	} catch (err) {
		fastify.log.error(`gRPC error: ${err}`)
	}
}

export default fastifyPlugin(grpcClients)
