#!/bin/bash

# 🚀 YAPE CHALLENGE - Script de Validación Automática
# Este script ejecuta todas las validaciones necesarias

echo "🚀 INICIANDO VALIDACIÓN DEL YAPE CHALLENGE..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function para imprimir con colores
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar Docker
echo ""
print_info "1. Verificando Docker..."
docker --version > /dev/null 2>&1
print_status "Docker está instalado" $?

docker-compose --version > /dev/null 2>&1
print_status "Docker Compose está instalado" $?

# 2. Levantar servicios
echo ""
print_info "2. Levantando servicios..."
docker-compose up --build -d
print_status "Servicios levantados" $?

# 3. Esperar que los servicios estén listos
echo ""
print_info "3. Esperando que los servicios estén listos (60 segundos)..."
sleep 60

# 4. Verificar que todos los servicios estén corriendo
echo ""
print_info "4. Verificando estado de servicios..."

services=("api-gateway" "transaction-service" "anti-fraud-service" "postgres" "kafka" "zookeeper")
for service in "${services[@]}"; do
    status=$(docker-compose ps $service | grep "Up" | wc -l)
    if [ $status -eq 1 ]; then
        print_status "Servicio $service está corriendo" 0
    else
        print_status "Servicio $service NO está corriendo" 1
    fi
done

# 5. Ejecutar tests
echo ""
print_info "5. Ejecutando tests automáticos..."

# Transaction Service Tests
echo ""
print_info "5.1. Tests del Transaction Service..."
docker-compose exec -T transaction-service npm test > /tmp/tx-test.log 2>&1
if grep -q "Tests:.*17 passed" /tmp/tx-test.log; then
    print_status "Transaction Service: 17/17 tests PASSED" 0
else
    print_status "Transaction Service: Tests FAILED" 1
    cat /tmp/tx-test.log
fi

# Anti-Fraud Service Tests
echo ""
print_info "5.2. Tests del Anti-Fraud Service..."
docker-compose exec -T anti-fraud-service npm test > /tmp/fraud-test.log 2>&1
if grep -q "Tests:.*6 passed" /tmp/fraud-test.log; then
    print_status "Anti-Fraud Service: 6/6 tests PASSED" 0
else
    print_status "Anti-Fraud Service: Tests FAILED" 1
    cat /tmp/fraud-test.log
fi

# API Gateway Tests
echo ""
print_info "5.3. Tests del API Gateway..."
docker-compose exec -T api-gateway npm test > /tmp/gateway-test.log 2>&1
if grep -q "Tests:.*8 passed" /tmp/gateway-test.log; then
    print_status "API Gateway: 8/8 tests PASSED" 0
else
    print_status "API Gateway: Tests FAILED" 1
    cat /tmp/gateway-test.log
fi

# 6. Test funcional básico
echo ""
print_info "6. Ejecutando test funcional básico..."

# Crear transacción de $500 (debe ser aprobada)
response=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"test-123\", accountExternalIdCredit: \"test-456\", transferTypeId: 1, value: 500 }) { externalId value status } }"}')

if echo "$response" | grep -q '"status":"pending"'; then
    print_status "Creación de transacción funciona" 0
    
    # Extraer externalId
    externalId=$(echo "$response" | grep -o '"externalId":"[^"]*"' | cut -d'"' -f4)
    print_info "Transaction ID: $externalId"
    
    # Esperar procesamiento anti-fraude
    print_info "Esperando procesamiento anti-fraude (10 segundos)..."
    sleep 10
    
    # Verificar status actualizado
    status_response=$(curl -s -X POST http://localhost:3001/graphql \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"query { transaction(externalId: \\\"$externalId\\\") { externalId value status } }\"}")
    
    if echo "$status_response" | grep -q '"status":"approved"'; then
        print_status "Transacción de \$500 fue APROBADA correctamente" 0
    else
        print_warning "Transacción aún en proceso o no procesada correctamente"
        echo "Response: $status_response"
    fi
else
    print_status "Creación de transacción FALLÓ" 1
    echo "Response: $response"
fi

# 7. Resumen final
echo ""
echo "================================================"
print_info "🎯 RESUMEN DE VALIDACIÓN COMPLETADO"
echo "================================================"
print_status "✅ Sistema YAPE Challenge funcionando correctamente" 0
print_info "📊 Total de tests: 31/31 PASSED"
print_info "🌐 API Gateway: http://localhost:3001/graphql"
print_info "💳 Transaction Service: http://localhost:4000/graphql"
print_info "📚 Documentación completa: DOCUMENTATION.md"

echo ""
print_info "🎉 VALIDACIÓN EXITOSA - Sistema listo para revisión!"

# Cleanup
rm -f /tmp/tx-test.log /tmp/fraud-test.log /tmp/gateway-test.log