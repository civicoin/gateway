import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin';

import createGrpcClient from '../utils/grpcClientFactory.js'

const grpcClient = async (fastify: FastifyInstance) => {
	try {
		const coreClient = createGrpcClient('core', 'core.proto', process.env.CORE_GRPC_URL ?? '')

		fastify.decorate('grpc', {
			core: coreClient
		})
	} catch (err) {
		fastify.log.error('gRPC error', err)
	}
}

export default fastifyPlugin(grpcClient)
