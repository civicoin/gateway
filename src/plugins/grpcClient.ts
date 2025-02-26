import * as grpc from '@grpc/grpc-js'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { CoreClient } from '../generated/core'

export enum GRPCCoreService {
	CORE = 'Core'
}

export type GRPCCoreClients = {
	[GRPCCoreService.CORE]: CoreClient
}

const coreServices = [
	{
		internalName: 'core',
		serviceClient: GRPCCoreService.CORE,
		name: GRPCCoreService.CORE,
		protoFile: 'core.proto',
		address: process.env.CORE_GRPC_URL ?? ''
	}
]

const grpcClients = async (fastify: FastifyInstance) => {
	try {
		const servicesClients = {
			[GRPCCoreService.CORE]: CoreClient
		}

		const coreClients = coreServices.reduce((clients, { name, serviceClient, address }) => {
			clients[name] = new servicesClients[serviceClient](
				address,
				grpc.credentials.createInsecure()
			)

			return clients
		}, {} as GRPCCoreClients)

		fastify.decorate('grpc', {
			coreClients
		})
	} catch (err) {
		console.error(err)
		fastify.log.error(`gRPC error: ${err}`)
	}
}

export default fastifyPlugin(grpcClients)
