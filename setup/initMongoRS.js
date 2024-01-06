console.log('\nInit mongo replica set\n')

const admin = db.getSiblingDB('admin')

admin.auth(rootUsername, rootPassword)

const config = {
	_id: 'mongo-set',
	version: 1,
	members: [
		{ _id: 1, host: `${m1}:${port}`, priority: 2 },
		{ _id: 2, host: `${m2}:${port}`, priority: 1 }
	]
}

const initiateResult = rs.initiate(config, { force: true })
console.log(initiateResult)

const statusResult = rs.status()
console.log(statusResult)
