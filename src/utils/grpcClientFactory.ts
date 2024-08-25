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

const createGrpcClient = (serviceName: string, protoFilename: string, address: string) => {
	const packageDefinition = protoLoader.loadSync(
		path.resolve(CIVI_PROTO_FILES_PATH, protoFilename),
		defaultProtoOptions
	)

	const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
	const Service = protoDescriptor[serviceName] as ServiceClientConstructor

	return new Service(address, grpc.credentials.createInsecure())
}

export default createGrpcClient
