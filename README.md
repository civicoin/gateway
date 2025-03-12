# Gateway

The main service of the platform. Provides API, systems and members management, services orchestration

-   **Stack:** Node, Fastify, Prisma, zod
-   **DB:** MongoDB
-   External communication: REST with JWT
-   Internal: gRPC and RabbitMQ with HMAC

Now works with [the Core](https://github.com/civicoin/core)

# Docker

Run Gateway, Mongo (replicas set) and RabbitMQ

```
openssl rand -base64 756 > ./setup/mongo-key
docker network create --internal shared_internal_network
docker compose -p civicoin -f ./setup/docker-compose.yml up -d
```

# Development

Dev mode — `npm run dev`

Docs (Swagger) — /docs

## Schema update

After schema update run `prisma db push`

> Make **on-demand** updates: any new fields added are explicitly defined as optional or with default value

## Preparation

First, install Node packages — `npm i`

Generate Prisma schema and DB files — `npm run db:client`

Generate gRPC — `npm run proto:generate`

### Mongo init

MongoDB works as a replicas set (it makes service more resilient to database failures and is required by Mongo Transactions, which Prisma uses)

**First, it’s necessary to generate the key file for replicas authentication:**

```
openssl rand -base64 756 > ./setup/mongo-key
```

For Windows just copy generated key to `setup` folder

`MONGO_INIT` envs are used for root user, `MONGO` for service

**Start it using Docker:**

```
docker build -t gateway-mongo -f ./setup/MONGO.DOCKERFILE setup
docker-compose -f ./setup/mongo-compose.yml --env-file .env up -d
```

**Update `hosts` with mongo containers mapped to localhost:** (_/etc/hosts_ or _C:\Windows\System32\drivers\etc\hosts_)

```
127.0.0.1 mongo1
127.0.0.1 mongo2
```

Use `MONGODB_URL` to connect (for example, with [MongoDB Compass](https://www.mongodb.com/products/tools/compass))

### RabbitMQ init

**With Docker:**

```
docker run -d --name rabbitmq -p 5672:5672 -p 5673:5673 -p 15672:15672 rabbitmq:management
```

Management can then be accessible at `http://127.0.0.1:15672` with the default credentials `guest:guest`

## Environment variables

Check `.env.example`

# Important notes

-   [In progress] On member creation we generate the keys pair (private/public), encrypt private with the member's password (before we hash it), then encrypt result with the secret and save. Member can get his encrypted with his password private after login, and decrypt it locally with the password. The private is used to sign the transactions (they will be verified at the Core with the public)

# WTF is going on here

-   **Prisma** is used instead of **mongoose** for database substitutability
-   At Mongo we use `UUID` instead of `ObjectId` because of easy compatibility with Postgres at other services, which has to store systems and members ids
