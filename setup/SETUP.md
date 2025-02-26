Only Mongo DB

```
docker build -t gateway-mongo -f ./setup/DOCKERFILE setup
docker-compose -p civicoin-mongo -f ./setup/mongo-compose.yml --env-file .env up -d
```

Gateway and infrastructure (Gateway, Mongo DB, RabbitMQ)

```
docker compose -p civicoin -f ./setup/docker-compose.yml --env-file .env up -d
```

Gateway, infrastructure and Core (Gateway, Mongo DB, RabbitMQ, Core, Postgres)

```
**In progress**
```
