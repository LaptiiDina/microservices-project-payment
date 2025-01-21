#!/bin/bash
while ! echo ruok | nc zookeeper 2181 | grep imok; do
  echo "Waiting for Zookeeper..."
  sleep 2
done
echo "Zookeeper is ready!"
exec "$@"
