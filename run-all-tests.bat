@echo off
REM Script to run all tests across all microservices (Windows version)
REM Usage: run-all-tests.bat

echo 🧪 Running All Tests for Yape Challenge Microservices
echo =======================================================

echo.
echo 📦 Testing Transaction Service
echo ----------------------------------------
if exist "transaction-service" (
    cd transaction-service
    if exist "package.json" (
        echo Installing dependencies...
        call npm install --silent
        echo Running unit tests...
        call npm run test
        echo Running tests with coverage...
        call npm run test:cov
        echo ✅ Transaction Service tests completed
    ) else (
        echo ❌ No package.json found in transaction-service
    )
    cd ..
) else (
    echo ❌ Directory transaction-service not found
)

echo.
echo 📦 Testing Anti-Fraud Service
echo ----------------------------------------
if exist "anti-fraud-service" (
    cd anti-fraud-service
    if exist "package.json" (
        echo Installing dependencies...
        call npm install --silent
        echo Running unit tests...
        call npm run test
        echo Running tests with coverage...
        call npm run test:cov
        echo ✅ Anti-Fraud Service tests completed
    ) else (
        echo ❌ No package.json found in anti-fraud-service
    )
    cd ..
) else (
    echo ❌ Directory anti-fraud-service not found
)

echo.
echo 📦 Testing API Gateway
echo ----------------------------------------
if exist "api-gateway" (
    cd api-gateway
    if exist "package.json" (
        echo Installing dependencies...
        call npm install --silent
        echo Running unit tests...
        call npm run test
        echo Running tests with coverage...
        call npm run test:cov
        echo ✅ API Gateway tests completed
    ) else (
        echo ❌ No package.json found in api-gateway
    )
    cd ..
) else (
    echo ❌ Directory api-gateway not found
)

echo.
echo 🎉 All tests completed!
echo =======================================================
pause