FROM postgres:16-alpine

EXPOSE 5432

COPY ./sql /docker-entrypoint-initdb.d/

# ENTRYPOINT ["docker-entrypoint.sh"]

# CMD [ "postgres" ]