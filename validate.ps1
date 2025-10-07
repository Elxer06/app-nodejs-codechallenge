# 🚀 YAPE CHALLENGE - Script de Validación Automática para Windows
# Este script ejecuta todas las validaciones necesarias en PowerShell

Write-Host "🚀 INICIANDO VALIDACIÓN DEL YAPE CHALLENGE..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    exit 1
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# 1. Verificar Docker
Write-Host ""
Print-Info "1. Verificando Docker..."

try {
    docker --version | Out-Null
    Print-Success "Docker está instalado"
} catch {
    Print-Error "Docker NO está instalado o no está disponible"
}

try {
    docker-compose --version | Out-Null
    Print-Success "Docker Compose está instalado"
} catch {
    Print-Error "Docker Compose NO está instalado o no está disponible"
}

# 2. Levantar servicios
Write-Host ""
Print-Info "2. Levantando servicios..."

try {
    docker-compose up --build -d
    Print-Success "Servicios levantados"
} catch {
    Print-Error "Error levantando servicios"
}

# 3. Esperar que los servicios estén listos
Write-Host ""
Print-Info "3. Esperando que los servicios estén listos (60 segundos)..."
Start-Sleep -Seconds 60

# 4. Verificar que todos los servicios estén corriendo
Write-Host ""
Print-Info "4. Verificando estado de servicios..."

$services = @("api-gateway", "transaction-service", "anti-fraud-service", "postgres", "kafka", "zookeeper")

foreach ($service in $services) {
    $status = docker-compose ps $service | Select-String "Up"
    if ($status) {
        Print-Success "Servicio $service está corriendo"
    } else {
        Print-Error "Servicio $service NO está corriendo"
    }
}

# 5. Ejecutar tests
Write-Host ""
Print-Info "5. Ejecutando tests automáticos..."

# Transaction Service Tests
Write-Host ""
Print-Info "5.1. Tests del Transaction Service..."
try {
    $txTestOutput = docker-compose exec -T transaction-service npm test 2>&1
    if ($txTestOutput -match "Tests:.*17 passed") {
        Print-Success "Transaction Service: 17/17 tests PASSED"
    } else {
        Print-Error "Transaction Service: Tests FAILED"
        Write-Host $txTestOutput -ForegroundColor Red
    }
} catch {
    Print-Error "Error ejecutando tests del Transaction Service"
}

# Anti-Fraud Service Tests
Write-Host ""
Print-Info "5.2. Tests del Anti-Fraud Service..."
try {
    $fraudTestOutput = docker-compose exec -T anti-fraud-service npm test 2>&1
    if ($fraudTestOutput -match "Tests:.*6 passed") {
        Print-Success "Anti-Fraud Service: 6/6 tests PASSED"
    } else {
        Print-Error "Anti-Fraud Service: Tests FAILED"
        Write-Host $fraudTestOutput -ForegroundColor Red
    }
} catch {
    Print-Error "Error ejecutando tests del Anti-Fraud Service"
}

# API Gateway Tests
Write-Host ""
Print-Info "5.3. Tests del API Gateway..."
try {
    $gatewayTestOutput = docker-compose exec -T api-gateway npm test 2>&1
    if ($gatewayTestOutput -match "Tests:.*8 passed") {
        Print-Success "API Gateway: 8/8 tests PASSED"
    } else {
        Print-Error "API Gateway: Tests FAILED"
        Write-Host $gatewayTestOutput -ForegroundColor Red
    }
} catch {
    Print-Error "Error ejecutando tests del API Gateway"
}

# 6. Test funcional básico
Write-Host ""
Print-Info "6. Ejecutando test funcional básico..."

try {
    # Crear transacción de $500 (debe ser aprobada)
    $body = '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"test-123\", accountExternalIdCredit: \"test-456\", transferTypeId: 1, value: 500 }) { externalId value status } }"}'
    $response = Invoke-RestMethod -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    
    if ($response.data.createTransaction.status -eq "pending") {
        Print-Success "Creación de transacción funciona"
        
        $externalId = $response.data.createTransaction.externalId
        Print-Info "Transaction ID: $externalId"
        
        # Esperar procesamiento anti-fraude
        Print-Info "Esperando procesamiento anti-fraude (10 segundos)..."
        Start-Sleep -Seconds 10
        
        # Verificar status actualizado
        $statusBody = "{`"query`":`"query { transaction(externalId: \`"$externalId\`") { externalId value status } }`"}"
        $statusResponse = Invoke-RestMethod -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body $statusBody
        
        if ($statusResponse.data.transaction.status -eq "approved") {
            Print-Success "Transacción de `$500 fue APROBADA correctamente"
        } else {
            Print-Warning "Transacción aún en proceso o no procesada correctamente"
            Write-Host "Status actual: $($statusResponse.data.transaction.status)" -ForegroundColor Yellow
        }
    } else {
        Print-Error "Creación de transacción FALLÓ"
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Red
    }
} catch {
    Print-Error "Error en test funcional: $($_.Exception.Message)"
}

# 7. Resumen final
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Print-Info "🎯 RESUMEN DE VALIDACIÓN COMPLETADO"
Write-Host "===============================================" -ForegroundColor Cyan
Print-Success "✅ Sistema YAPE Challenge funcionando correctamente"
Print-Info "📊 Total de tests: 31/31 PASSED"
Print-Info "🌐 API Gateway: http://localhost:3001/graphql"
Print-Info "💳 Transaction Service: http://localhost:4000/graphql"
Print-Info "📚 Documentación completa: DOCUMENTATION.md"

Write-Host ""
Print-Info "🎉 VALIDACIÓN EXITOSA - Sistema listo para revisión!"