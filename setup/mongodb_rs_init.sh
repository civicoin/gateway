#!/bin/bash

m1=mongo1
m2=mongo2
port=${PORT:-27017}

mongo_init_username=${MONGO_INITDB_ROOT_USERNAME:-root}
mongo_init_password=${MONGO_INITDB_ROOT_PASSWORD:-root}

mongo_username=${MONGO_USERNAME:-mongo}
mongo_password=${MONGO_PASSWORD:-pass}
mongo_database=${MONGO_DATABASE:-gateway}

until mongosh --host ${m1}:${port} --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
    printf '.'
    sleep 1
done

mongosh --host ${m1}:${port} --eval '
    const m1 = "'$m1'"; 
    const m2 = "'$m2'"; 
    const port = "'$port'"; 
    const rootUsername = "'$mongo_init_username'"; 
    const rootPassword = "'$mongo_init_password'";
' /scripts/initMongoRS.js

mongosh --host ${m1}:${port} --eval '
    const username = "'$mongo_username'"
    const password = "'$mongo_password'"
    const database = "'$mongo_database'"
    const rootUsername = "'$mongo_init_username'"; 
    const rootPassword = "'$mongo_init_password'";
' /scripts/initMongoUser.js
