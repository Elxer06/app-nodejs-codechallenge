import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/transactions/infrastructure/prisma.service';

describe('TransactionController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.transaction.deleteMany();
  });

  describe('GraphQL Mutations', () => {
    it('should create a transaction', async () => {
      const createTransactionMutation = `
        mutation {
          createTransaction(input: {
            accountExternalIdDebit: "123e4567-e89b-12d3-a456-426614174001"
            accountExternalIdCredit: "123e4567-e89b-12d3-a456-426614174002"
            transferTypeId: 1
            value: 100.50
          }) {
            externalId
            accountExternalIdDebit
            accountExternalIdCredit
            transferTypeId
            value
            status
            createdAt
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createTransactionMutation,
        })
        .expect(200);

      expect(response.body.data.createTransaction).toMatchObject({
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 100.50,
        status: 'pending',
      });
      expect(response.body.data.createTransaction.externalId).toBeDefined();
      expect(response.body.data.createTransaction.createdAt).toBeDefined();
    });

    it('should fail to create transaction with invalid input', async () => {
      const createTransactionMutation = `
        mutation {
          createTransaction(input: {
            accountExternalIdDebit: ""
            accountExternalIdCredit: "123e4567-e89b-12d3-a456-426614174002"
            transferTypeId: 1
            value: -100
          }) {
            externalId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createTransactionMutation,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GraphQL Queries', () => {
    it('should get a transaction by externalId', async () => {
      // First, create a transaction
      const transaction = await prismaService.transaction.create({
        data: {
          externalId: '123e4567-e89b-12d3-a456-426614174000',
          accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
          accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
          transferTypeId: 1,
          value: 150.75,
          status: 'approved',
        },
      });

      const getTransactionQuery = `
        query {
          transaction(externalId: "${transaction.externalId}") {
            externalId
            accountExternalIdDebit
            accountExternalIdCredit
            transferTypeId
            value
            status
            createdAt
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: getTransactionQuery,
        })
        .expect(200);

      expect(response.body.data.transaction).toMatchObject({
        externalId: transaction.externalId,
        accountExternalIdDebit: transaction.accountExternalIdDebit,
        accountExternalIdCredit: transaction.accountExternalIdCredit,
        transferTypeId: transaction.transferTypeId,
        value: transaction.value,
        status: transaction.status,
      });
    });

    it('should return error for non-existent transaction', async () => {
      const getTransactionQuery = `
        query {
          transaction(externalId: "non-existent-id") {
            externalId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: getTransactionQuery,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('Transaction Status Flow', () => {
    it('should create transaction with pending status and allow status updates', async () => {
      // Create transaction
      const createdTransaction = await prismaService.transaction.create({
        data: {
          externalId: '123e4567-e89b-12d3-a456-426614174000',
          accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
          accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
          transferTypeId: 1,
          value: 500.00,
          status: 'pending',
        },
      });

      expect(createdTransaction.status).toBe('pending');

      // Update status to approved
      const updatedTransaction = await prismaService.transaction.update({
        where: { externalId: createdTransaction.externalId },
        data: { status: 'approved' },
      });

      expect(updatedTransaction.status).toBe('approved');
    });
  });
});