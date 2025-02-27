**Only Mongo DB Replicas**

Uses .env `MONGO_INIT_USERNAME` and `MONGO_INIT_PASSWORD`

```
docker build -t gateway-mongo -f ./setup/MONGO.DOCKERFILE setup
docker-compose -p civicoin-mongo -f ./setup/mongo-compose.yml up -d
```

**Gateway and infrastructure** (Gateway, Mongo DB, RabbitMQ)

```
docker compose -p civicoin -f ./setup/docker-compose.yml up -d
```

**Gateway, infrastructure and Core** (Gateway, Mongo DB, RabbitMQ, Core, Postgres)

```
*In progress*
```
