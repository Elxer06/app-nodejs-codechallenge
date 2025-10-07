#!/bin/bash

# Script to run all tests across all microservices
# Usage: ./run-all-tests.sh

set -e

echo "🧪 Running All Tests for Yape Challenge Microservices"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests for a service
run_service_tests() {
    local service_name=$1
    local service_dir=$2
    
    echo -e "\n${YELLOW}📦 Testing $service_name${NC}"
    echo "----------------------------------------"
    
    if [ -d "$service_dir" ]; then
        cd "$service_dir"
        
        # Check if package.json exists
        if [ -f "package.json" ]; then
            echo "Installing dependencies..."
            npm install --silent
            
            echo "Running unit tests..."
            npm run test
            
            echo "Running tests with coverage..."
            npm run test:cov
            
            # Run e2e tests if available
            if npm run | grep -q "test:e2e"; then
                echo "Running e2e tests..."
                npm run test:e2e
            fi
            
            echo -e "${GREEN}✅ $service_name tests completed${NC}"
        else
            echo -e "${RED}❌ No package.json found in $service_dir${NC}"
        fi
        
        cd ..
    else
        echo -e "${RED}❌ Directory $service_dir not found${NC}"
    fi
}

# Main execution
echo "Starting test execution..."

# Run tests for each microservice
run_service_tests "Transaction Service" "transaction-service"
run_service_tests "Anti-Fraud Service" "anti-fraud-service"
run_service_tests "API Gateway" "api-gateway"

echo -e "\n${GREEN}🎉 All tests completed!${NC}"
echo "======================================================="

# Generate combined coverage report (if needed)
echo -e "\n${YELLOW}📊 Generating combined coverage report...${NC}"

# You can add logic here to combine coverage reports from all services
# For example, using tools like nyc or istanbul-combine

echo -e "${GREEN}✅ Test execution completed successfully!${NC}"