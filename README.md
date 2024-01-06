# Gateway

The main service of Civicoin. Provides API, systems and members management, services orchestration

- **Stack:** Node, Fastify, Prisma, zod
- **DB:** MongoDB
- Communication with REST and RabbitMQ

# Development

Dev mode — `npm run dev`

## Schema update

After schema update run `prisma db push`

> Make **on-demand** updates: any new fields added are explicitly defined as optional or with default value

## Preparation

Firstly, install Node packages — `npm i`

Generate Prisma schema — `npx prisma generate`

### Mongo init

MongoDB works as a replicas set (it makes service more resilient to database failures and is required by Mongo Transactions, which Prisma uses)

**Firstly, it’s necessary to generate key file for replicas authentication:**
```
openssl rand -base64 756 > ./setup/mongo-key
```

For Windows just copy generated key to `setup` folder

`MONGO_INIT` envs are used for root user, `MONGO` for service

**Start it using Docker:**
```
docker build -t gateway-mongo -f ./setup/DOCKERFILE setup
docker-compose -f ./setup/mongo-compose.yml --env-file .env up
```

**Update `hosts` with mongo containers mapped to localhost:** (*/etc/hosts* or *C:\Windows\System32\drivers\etc\hosts*)
```
127.0.0.1 mongo1
127.0.0.1 mongo2
```

## Environment variables
```
SECRET=secret

MONGO_INIT_USERNAME=root
MONGO_INIT_PASSWORD=root
MONGO_USERNAME=mongo
MONGO_PASSWORD=pass
MONGO_DATABASE=gateway

MONGODB_URL=mongodb://mongo:pass@localhost:27701,localhost:27702/gateway?replicaSet=mongo-set

```

# WTF is going on here

- **Prisma** is used instead of **mongoose** for database substitutability
- At Mongo we use `UUID` instead of `ObjectId` because of easy compatibility with Postgres at other services, which has to store systems and members ids
