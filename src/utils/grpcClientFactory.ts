import path from 'path'
import protoLoader from '@grpc/proto-loader'
import grpc, { ServiceClientConstructor } from '@grpc/grpc-js'

const CIVI_PROTO_FILES_PATH = 'node_modules/civi/protos'

const defaultProtoOptions = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
}

const createGrpcClient = <T>(serviceName: string, protoFilename: string, address: string): T => {
	const packageDefinition = protoLoader.loadSync(
		path.resolve(CIVI_PROTO_FILES_PATH, protoFilename),
		defaultProtoOptions
	)

	const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)

	if (!protoDescriptor || !(serviceName in protoDescriptor)) {
		throw new Error(`Service "${serviceName}" not found in proto file "${protoFilename}"`)
	}

	const Service = protoDescriptor[serviceName] as ServiceClientConstructor

	return new Service(address, grpc.credentials.createInsecure()) as T
}

export default createGrpcClient
