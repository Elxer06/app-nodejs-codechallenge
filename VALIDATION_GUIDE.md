# 🚀 YAPE CHALLENGE - Guía de Validación Rápida

## ⚡ Inicio Rápido (5 minutos)

### 1. Levantar el Sistema
```bash
# 1. Clonar (si no está clonado)
git clone https://github.com/Elxer06/app-nodejs-codechallenge.git
cd app-nodejs-codechallenge

# 2. Levantar toda la infraestructura
docker-compose up --build -d

# 3. Esperar 30-60 segundos para que todos los servicios estén listos
```

### 2. Verificar que Todo Está Funcionando
```bash
# Verificar servicios corriendo
docker-compose ps

# Verificar logs (deben mostrar servicios iniciados)
docker-compose logs api-gateway | findstr "3001"          # Windows
docker-compose logs transaction-service | findstr "4000"   # Windows

# O en Linux/Mac:
docker-compose logs api-gateway | grep "3001"
docker-compose logs transaction-service | grep "4000"
```

**✅ Resultado esperado:** Todos los servicios deben estar "Up" y los logs deben mostrar los puertos activos.

### 3. Ejecutar Tests (Validación Automática)
```bash
# Ejecutar TODOS los tests
docker-compose exec transaction-service npm test   # Debe pasar 17/17
docker-compose exec anti-fraud-service npm test    # Debe pasar 6/6  
docker-compose exec api-gateway npm test           # Debe pasar 8/8
```

**✅ Resultado esperado:** `31/31 tests passing` - TODOS deben pasar sin errores.

---

## 🧪 Validación Manual del Flujo de Negocio

### Test Case 1: Transacción Aprobada ($500 ≤ $1000)

**PowerShell (Windows):**
```powershell
# Crear transacción
$response = Invoke-WebRequest -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"test-123\", accountExternalIdCredit: \"test-456\", transferTypeId: 1, value: 500 }) { externalId value status } }"}'

# Ver respuesta
$response.Content

# Extraer externalId para próximo test (reemplazar con el UUID real)
$externalId = "REEMPLAZAR_CON_UUID_RETORNADO"

# Esperar 5 segundos para procesamiento
Start-Sleep 5

# Consultar status actualizado
$response2 = Invoke-WebRequest -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"query`":`"query { transaction(externalId: \`"$externalId\`") { externalId value status } }`"}"
$response2.Content
```

**Bash (Linux/Mac):**
```bash
# Crear transacción
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"test-123\", accountExternalIdCredit: \"test-456\", transferTypeId: 1, value: 500 }) { externalId value status } }"}'

# Guardar el externalId retornado y consultar después de 5 segundos
sleep 5

curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { transaction(externalId: \"REEMPLAZAR_CON_UUID\") { externalId value status } }"}'
```

**✅ Resultado esperado:**
```json
// Primera respuesta (creación)
{"data":{"createTransaction":{"externalId":"uuid-generado","value":500,"status":"pending"}}}

// Segunda respuesta (después de 5 segundos)  
{"data":{"transaction":{"externalId":"uuid-generado","value":500,"status":"approved"}}}
```

### Test Case 2: Transacción Rechazada ($1500 > $1000)

**PowerShell:**
```powershell
# Crear transacción grande
$response = Invoke-WebRequest -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"big-account\", accountExternalIdCredit: \"reject-test\", transferTypeId: 1, value: 1500 }) { externalId value status } }"}'
$response.Content

# Extraer externalId y consultar después
$externalId = "REEMPLAZAR_CON_UUID_RETORNADO"
Start-Sleep 5

$response2 = Invoke-WebRequest -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"query`":`"query { transaction(externalId: \`"$externalId\`") { externalId value status } }`"}"
$response2.Content
```

**✅ Resultado esperado:**
```json
// Primera respuesta (creación)
{"data":{"createTransaction":{"externalId":"uuid-generado","value":1500,"status":"pending"}}}

// Segunda respuesta (después de 5 segundos)
{"data":{"transaction":{"externalId":"uuid-generado","value":1500,"status":"rejected"}}}
```

---

## 🔍 Validación de Logs en Tiempo Real

### Monitorear el Flujo Completo

**Abrir 3 terminales:**

```bash
# Terminal 1: API Gateway
docker-compose logs -f api-gateway

# Terminal 2: Transaction Service  
docker-compose logs -f transaction-service

# Terminal 3: Anti-Fraud Service
docker-compose logs -f anti-fraud-service
```

### Ejecutar una Transacción y Observar

**En otra terminal, ejecutar:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"monitor-test\", accountExternalIdCredit: \"log-test\", transferTypeId: 1, value: 750 }) { externalId value status } }"}'
```

**✅ Logs esperados:**

**Transaction Service:**
```
📤 Evento de transacción enviado a Kafka
📥 Status update recibido: { externalId: 'uuid', status: 'approved' }
✅ Status de transacción actualizado exitosamente
```

**Anti-Fraud Service:**
```
🔍 Processing transaction: uuid
✅ Transaction uuid APPROVED - Amount: 750
📤 Anti-Fraud: Status update sent for transaction uuid: approved
```

---

## 🏆 Criterios de Aceptación

### ✅ El sistema está funcionando correctamente si:

1. **✅ Infraestructura:**
   - [ ] 6 contenedores Docker corriendo sin errores
   - [ ] Puertos 3001, 4000, 4001, 5432, 29092, 2181 activos

2. **✅ Tests Automáticos:**
   - [ ] Transaction Service: 17/17 tests ✅
   - [ ] Anti-Fraud Service: 6/6 tests ✅
   - [ ] API Gateway: 8/8 tests ✅

3. **✅ Funcionalidad de Negocio:**
   - [ ] Transacciones ≤ $1000 → `pending` → `approved`
   - [ ] Transacciones > $1000 → `pending` → `rejected`
   - [ ] Consultas por externalId funcionan
   - [ ] Cambios de status visible en logs

4. **✅ Arquitectura:**
   - [ ] API Gateway en puerto 3001 funciona como proxy
   - [ ] GraphQL Playground accesible
   - [ ] Comunicación asíncrona Kafka visible en logs
   - [ ] Base de datos persistiendo transacciones

---

## 🚨 Troubleshooting Rápido

### Si algo no funciona:

**1. Servicios no inician:**
```bash
# Reiniciar todo
docker-compose down
docker-compose up --build -d

# Verificar logs de errores
docker-compose logs
```

**2. Tests fallan:**
```bash
# Verificar que servicios estén listos
docker-compose ps

# Esperar 60 segundos y reintentar
docker-compose exec transaction-service npm test
```

**3. API no responde:**
```bash
# Verificar puertos
netstat -tulpn | grep :3001  # Linux
netstat -an | findstr :3001  # Windows

# Verificar logs del gateway
docker-compose logs api-gateway
```

---

## 📋 Checklist Final para Revisor

### ✅ Validación Completa:

- [ ] **Setup:** `docker-compose up --build -d` ejecutado sin errores
- [ ] **Status:** `docker-compose ps` muestra 6 servicios "Up"
- [ ] **Tests:** 31/31 tests passing en los 3 servicios
- [ ] **Flujo 1:** Transacción $500 → approved
- [ ] **Flujo 2:** Transacción $1500 → rejected  
- [ ] **Logs:** Flujo completo visible en logs
- [ ] **Arquitectura:** API Gateway funcionando como proxy único

### 🎯 Tiempo Estimado de Validación: **10-15 minutos**

**Si todos los checkboxes están marcados, el sistema está funcionando perfectamente.**

---

**📞 Soporte:** Revisar `DOCUMENTATION.md` para detalles técnicos completos.  
**🔗 API:** http://localhost:3001/graphql (GraphQL Playground)  
**✅ Status:** PRODUCTION READY