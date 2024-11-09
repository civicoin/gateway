import path from 'path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import { type OpenAPI } from 'openapi-types'

import { app, initFastify } from './server.js'

enum OpenApiFileTypes {
	YAML = ".yaml", JSON = ".json"
}

/** NOTE: yaml format is broken somewhere */
export async function regenerateOpenApi(fastifySwaggerObject: OpenAPI.Document, filetype=OpenApiFileTypes.JSON, filename="openApiSchema") {
	const genFilePath = path.resolve(fileURLToPath(import.meta.url), "../../generated")
	if (!fs.existsSync(genFilePath)) {
		fs.mkdirSync(genFilePath, { recursive: true })
	}

	let fileStroke: string
	if (filetype === OpenApiFileTypes.YAML) {
		const YAML = await import('yaml')
		fileStroke = YAML.stringify(fastifySwaggerObject, null, { lineWidth: Infinity })
	} else {
		fileStroke = JSON.stringify(fastifySwaggerObject, null, 2)
	}
	fs.writeFileSync(path.join(genFilePath, filename + filetype), fileStroke)

	console.log("OpenApi schema was rewrote")
}

initFastify(app)
app.ready().then(async () => {
	const openApiSchema = app.swagger()
	await regenerateOpenApi(openApiSchema)
	await app.close()
	/** bad way, but IDK why it's still working... */
	process.exit(0)
})
