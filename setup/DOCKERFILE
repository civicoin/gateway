FROM mongo

COPY mongo-key /etc/mongo-key
COPY mongodb_rs_init.sh /scripts/mongodb_rs_init.sh
COPY initMongoRS.js /scripts/initMongoRS.js
COPY initMongoUser.js /scripts/initMongoUser.js

RUN chown mongodb:mongodb /etc/mongo-key
RUN chmod 400 /etc/mongo-key

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mongod"]
