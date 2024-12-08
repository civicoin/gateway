import * as grpc from '@grpc/grpc-js'
import { createRequire } from 'module'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

const require = createRequire(import.meta.url)
const { CoreClient } = require('./../generated/core_grpc_pb')

export enum GRPCCoreService {
	CORE = 'Core'
}

export type GRPCCoreClients = {
	[GRPCCoreService.CORE]: typeof CoreClient
}

const coreServices = [
	{
		internalName: 'core1',
		ServiceClient: CoreClient,
		name: GRPCCoreService.CORE,
		protoFile: 'core.proto',
		address: process.env.CORE_GRPC_URL ?? ''
	}
]

const grpcClients = async (fastify: FastifyInstance) => {
	try {
		const coreClients = coreServices.reduce((clients, { name, ServiceClient, address }) => {
			clients[name] = new ServiceClient(address, grpc.credentials.createInsecure())
			return clients
		}, {} as GRPCCoreClients)

		fastify.decorate('grpc', {
			coreClients
		})
	} catch (err) {
		fastify.log.error(`gRPC error: ${err}`)
	}
}

export default fastifyPlugin(grpcClients)
