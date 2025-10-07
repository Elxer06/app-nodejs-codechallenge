# Yape Code Challenge :rocket:

Our code challenge will let you marvel us with your Jedi coding skills :smile:. 

Don't forget that the proper way to submit your work is to fork the repo and create a PR :wink: ... have fun !!

## ✅ **IMPLEMENTATION STATUS: COMPLETED** 

- ✅ **31/31 Tests Passing** (100% Coverage)
- ✅ **Microservices Architecture** with NestJS + TypeScript
- ✅ **GraphQL Federation** via API Gateway
- ✅ **Event-Driven Architecture** with Kafka
- ✅ **Anti-Fraud Real-time Processing**
- ✅ **Docker Orchestration** Complete

## 📚 **DOCUMENTATION**

- **🚀 [QUICK VALIDATION GUIDE](./VALIDATION_GUIDE.md)** - Start here! 5-minute validation
- **📋 [COMPLETE TECHNICAL DOCUMENTATION](./DOCUMENTATION.md)** - Full system details
- **⚡ [Quick Start](#quick-start)** - Get running immediately

## ⚡ Quick Start

```bash
# 1. Clone and start
git clone https://github.com/Elxer06/app-nodejs-codechallenge.git
cd app-nodejs-codechallenge
docker-compose up --build -d

# 2. Run all tests (31 tests should pass)
docker-compose exec transaction-service npm test   # 17 tests
docker-compose exec anti-fraud-service npm test    # 6 tests  
docker-compose exec api-gateway npm test           # 8 tests

# 3. Test the API (PowerShell example)
Invoke-WebRequest -Uri "http://localhost:3001/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"mutation { createTransaction(input: { accountExternalIdDebit: \"acc-123\", accountExternalIdCredit: \"acc-456\", transferTypeId: 1, value: 500 }) { externalId value status } }"}'
```

**🎯 Expected Result:** Transaction created with status "pending" → automatically changes to "approved" (≤$1000) or "rejected" (>$1000)

---

## 🏗️ **IMPLEMENTED ARCHITECTURE**

```mermaid
graph TB
    Client[Client/Postman] --> Gateway[API Gateway :3001]
    Gateway --> TxService[Transaction Service :4000]
    TxService --> DB[(PostgreSQL :5432)]
    TxService --> Kafka[Kafka :29092]
    Kafka --> AntiFraud[Anti-Fraud Service :4001]
    AntiFraud --> Kafka
    Kafka --> TxService
```

**🔗 Access Points:**
- **API Gateway GraphQL Playground:** http://localhost:3001/graphql
- **Direct Transaction Service:** http://localhost:4000/graphql

---

## 📋 **ORIGINAL REQUIREMENTS**

- [Problem](#problem)
- [Tech Stack](#tech_stack)
- [Send us your challenge](#send_us_your_challenge)

# Problem

Every time a financial transaction is created it must be validated by our anti-fraud microservice and then the same service sends a message back to update the transaction status.
For now, we have only three transaction statuses:

<ol>
  <li>pending</li>
  <li>approved</li>
  <li>rejected</li>  
</ol>

Every transaction with a value greater than 1000 should be rejected.

```mermaid
  flowchart LR
    Transaction -- Save Transaction with pending Status --> transactionDatabase[(Database)]
    Transaction --Send transaction Created event--> Anti-Fraud
    Anti-Fraud -- Send transaction Status Approved event--> Transaction
    Anti-Fraud -- Send transaction Status Rejected event--> Transaction
    Transaction -- Update transaction Status event--> transactionDatabase[(Database)]
```

# Tech Stack

<ol>
  <li>Node. You can use any framework you want (i.e. Nestjs with an ORM like TypeOrm or Prisma) </li>
  <li>Any database</li>
  <li>Kafka</li>    
</ol>

We do provide a `Dockerfile` to help you get started with a dev environment.

You must have two resources:

1. Resource to create a transaction that must containt:

```json
{
  "accountExternalIdDebit": "Guid",
  "accountExternalIdCredit": "Guid",
  "tranferTypeId": 1,
  "value": 120
}
```

2. Resource to retrieve a transaction

```json
{
  "transactionExternalId": "Guid",
  "transactionType": {
    "name": ""
  },
  "transactionStatus": {
    "name": ""
  },
  "value": 120,
  "createdAt": "Date"
}
```

## Optional

You can use any approach to store transaction data but you should consider that we may deal with high volume scenarios where we have a huge amount of writes and reads for the same data at the same time. How would you tackle this requirement?

You can use Graphql;

# Send us your challenge

When you finish your challenge, after forking a repository, you **must** open a pull request to our repository. There are no limitations to the implementation, you can follow the programming paradigm, modularization, and style that you feel is the most appropriate solution.

If you have any questions, please let us know.
