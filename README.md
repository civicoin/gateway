# Gateway

The main service of Civicoin

Stack: *Node, Fastify, Prisma, zod*

# Development

Dev mode — `npm run dev`

## Preparation

### Mongo init

MongoDB works as a replicas set (it makes service more resilient to database failures and is required by Mongo Transactions, which Prisma uses)

**Firstly, it’s necessary to generate key file for replicas authentication:**
```
openssl rand -base64 756 > ./setup/mongo-key
```

At Windows just copy generated key to `setup` folder

`MONGO_INIT` envs are used for root user, `MONGO` for service

**Start it using Docker:**
```
docker build -t gateway-mongo -f ./setup/DOCKERFILE setup
docker-compose -f ./setup/mongo-compose.yml --env-file .env up
```

## Environment variables
```
SECRET=secret
MONGO_INIT_USERNAME=root
MONGO_INIT_PASSWORD=root
MONGO_USERNAME=mongo
MONGO_PASSWORD=pass
MONGO_DATABASE=gateway
MONGODB_URL=mongodb://mongo:pass@localhost:30001,localhost:30002/gateway?replicaSet=mongo-set

```
