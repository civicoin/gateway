console.log('\nInit mongo user\n')

const admin = db.getSiblingDB('admin')

admin.auth(rootUsername, rootPassword)

let retries = 10
let elected = false
while (retries > 0 && !elected) {
	console.log('Waiting for primary.... Retries left: ' + retries)

	const status = rs.status()

	if (status.myState === 1) {
		console.log('Primary node is elected.')
		elected = true
	} else {
		sleep(5000)
		retries--
	}
}

const createUserResult = admin.getSiblingDB(database).createUser({
	user: username,
	pwd: password,
	roles: [{ role: 'readWrite', db: database }]
})
console.log(createUserResult)
