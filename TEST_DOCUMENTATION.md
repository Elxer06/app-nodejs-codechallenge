# Test Scripts Documentation

## Running Tests

### Transaction Service Tests

```bash
cd transaction-service

# Install dependencies
npm install

# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

### Anti-Fraud Service Tests

```bash
cd anti-fraud-service

# Install dependencies
npm install

# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### API Gateway Tests

```bash
cd api-gateway

# Install dependencies
npm install

# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## Test Coverage Goals

- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: Critical user flows covered
- **E2E Tests**: End-to-end transaction flow

## Test Structure

### Unit Tests
- **Domain**: Transaction entity business logic
- **Application**: Use cases and business rules
- **Infrastructure**: Repository implementations (mocked)
- **Interfaces**: GraphQL resolvers and DTOs

### Integration Tests
- **Kafka Events**: Event publishing and consumption
- **Database Operations**: Prisma repository operations
- **GraphQL API**: Complete request/response cycles

### E2E Tests
- **Full Transaction Flow**: Create → Anti-fraud → Status update
- **Error Scenarios**: Invalid inputs, network failures
- **Performance Tests**: Load testing with multiple transactions

## Mock Strategy

### External Dependencies
- **Kafka**: Mocked in unit tests, real in integration tests
- **Database**: In-memory database for fast unit tests
- **HTTP Calls**: Mocked axios for API Gateway tests

### Test Data
- **Factories**: Use test data factories for consistent test data
- **Fixtures**: JSON fixtures for complex test scenarios
- **Builders**: Fluent builders for test object creation

## CI/CD Pipeline

```yaml
test:
  stage: test
  script:
    - npm run test:all-services
    - npm run test:integration
    - npm run test:e2e
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
```

## Best Practices

1. **Test Naming**: Use descriptive test names (should_return_approved_when_value_is_less_than_1000)
2. **Arrange-Act-Assert**: Clear test structure
3. **Independent Tests**: Each test should be isolated
4. **Fast Tests**: Unit tests should run quickly
5. **Deterministic**: Tests should always produce the same result