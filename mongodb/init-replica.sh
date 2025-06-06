#!/bin/bash

# Funzione per attendere un host Mongo "up" con mongosh
wait_for_mongo() {
  host=$1
  echo "Waiting for $host to be ready..."
  until mongosh --quiet --host "$host" --eval 'db.runCommand({ ping: 1 }).ok' | grep 1 >/dev/null; do
    sleep 2
  done
  echo "$host is ready"
}

wait_for_mongo mongodb:27017
wait_for_mongo mongo-secondary:27017

echo "Initiating replica set..."
mongosh --host mongodb:27017 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb:27017" },
    { _id: 1, host: "mongo-secondary:27017" },
    { _id: 2, host: "mongo-arbiter:27017", arbiterOnly: true }
  ]
});
EOF
