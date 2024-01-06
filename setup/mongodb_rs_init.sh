#!/bin/bash

m1=mongo1
m2=mongo2
m3=mongo3
port=${PORT:-27017}

until mongosh --host ${m1}:${port} --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
  printf '.'
  sleep 1
done

mongosh --host ${m1}:${port} << EOF
    const rootUser = '$MONGO_INITDB_ROOT_USERNAME'
    const rootPassword = '$MONGO_INITDB_ROOT_PASSWORD'
    const admin = db.getSiblingDB('admin')

    admin.auth(rootUser, rootPassword)

    const config = {
        "_id": "mongo-set",
        "version": 1,
        "members": [
            {
                "_id": 1,
                "host": "${m1}:${port}",
                "priority": 2
            },
            {
                "_id": 2,
                "host": "${m2}:${port}",
                "priority": 0
            },
            {
                "_id": 3,
                "host": "${m3}:${port}",
                "priority": 0
            }
        ]
    }

    rs.initiate(config, { force: true })
    rs.status()
EOF
