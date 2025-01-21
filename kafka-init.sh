#!/bin/bash
# Скрипт для создания топиков в Kafka при старте контейнера

create_topic_if_not_exists() {
    local topic_name=$1
    local partitions=$2
    local replication_factor=$3

    kafka-topics.sh --bootstrap-server kafka:9092 --list | grep -q "^$topic_name$"
    if [ $? -ne 0 ]; then
        kafka-topics.sh --create \
            --topic "$topic_name" \
            --bootstrap-server kafka:9092 \
            --partitions "$partitions" \
            --replication-factor "$replication_factor"
        echo "Топик '$topic_name' создан."
    else
        echo "Топик '$topic_name' уже существует."
    fi
}

create_topic_if_not_exists "order-placed" 1 1
create_topic_if_not_exists "order-cancelled" 1 1
create_topic_if_not_exists "user-created" 1 1
create_topic_if_not_exists "dead-letter-events" 1 1
