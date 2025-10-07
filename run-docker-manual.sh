#!/bin/bash

echo "🐳 Ejecutando Proyecto Yape Challenge en Docker"
echo "================================================"

echo "🧹 Limpiando contenedores anteriores..."
docker stop postgres_container kafka_container zookeeper_container transaction_service anti_fraud_service api_gateway 2>/dev/null || true
docker rm postgres_container kafka_container zookeeper_container transaction_service anti_fraud_service api_gateway 2>/dev/null || true

echo ""
echo "🐘 Paso 1: Iniciando PostgreSQL..."
docker run -d \
  --name postgres_container \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yape_db \
  postgres:14

echo "Esperando que PostgreSQL esté listo..."
sleep 10

echo ""
echo "🐹 Paso 2: Iniciando Zookeeper..."
docker run -d \
  --name zookeeper_container \
  -e ZOOKEEPER_CLIENT_PORT=2181 \
  confluentinc/cp-zookeeper:5.5.3

echo "Esperando que Zookeeper esté listo..."
sleep 5

echo ""
echo "📡 Paso 3: Iniciando Kafka..."
docker run -d \
  --name kafka_container \
  --link zookeeper_container:zookeeper \
  -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka:5.5.3

echo "Esperando que Kafka esté listo..."
sleep 15

echo ""
echo "🏗️ Paso 4: Construyendo Transaction Service..."
cd transaction-service
docker build -t transaction-service .
if [ $? -ne 0 ]; then
    echo "❌ Error construyendo Transaction Service"
    exit 1
fi

echo ""
echo "▶️ Paso 5: Iniciando Transaction Service..."
docker run -d \
  --name transaction_service \
  --link postgres_container:postgres \
  --link kafka_container:kafka \
  -p 4000:4000 \
  -e DATABASE_URL=postgres://postgres:postgres@postgres:5432/yape_db \
  -e KAFKA_BROKER=kafka:9092 \
  -e PORT=4000 \
  transaction-service

cd ..

echo "Esperando que Transaction Service esté listo..."
sleep 10

echo ""
echo "🏗️ Paso 6: Construyendo Anti-Fraud Service..."
cd anti-fraud-service
docker build -t anti-fraud-service .
if [ $? -ne 0 ]; then
    echo "❌ Error construyendo Anti-Fraud Service"
    exit 1
fi

echo ""
echo "▶️ Paso 7: Iniciando Anti-Fraud Service..."
docker run -d \
  --name anti_fraud_service \
  --link kafka_container:kafka \
  -p 4001:4001 \
  -e KAFKA_BROKER=kafka:9092 \
  -e PORT=4001 \
  anti-fraud-service

cd ..

echo "Esperando que Anti-Fraud Service esté listo..."
sleep 10

echo ""
echo "🏗️ Paso 8: Construyendo API Gateway..."
cd api-gateway
docker build -t api-gateway .
if [ $? -ne 0 ]; then
    echo "❌ Error construyendo API Gateway"
    exit 1
fi

echo ""
echo "▶️ Paso 9: Iniciando API Gateway..."
docker run -d \
  --name api_gateway \
  --link transaction_service:transaction-service \
  -p 3000:3000 \
  -e TRANSACTION_SERVICE_URL=http://transaction-service:4000/graphql \
  -e PORT=3000 \
  api-gateway

cd ..

echo ""
echo "✅ ¡Todos los servicios están en ejecución!"
echo ""
echo "📍 URLs de acceso:"
echo "  - API Gateway GraphQL: http://localhost:3000/graphql"
echo "  - Transaction Service GraphQL: http://localhost:4000/graphql"
echo "  - PostgreSQL: localhost:5432"
echo "  - Kafka: localhost:9092"
echo ""
echo "🔍 Para ver logs de un servicio:"
echo "  docker logs [nombre_contenedor]"
echo ""
echo "🛑 Para parar todos los servicios:"
echo "  docker stop postgres_container kafka_container zookeeper_container transaction_service anti_fraud_service api_gateway"
echo ""
echo "🎉 Ejecución completada"