import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionService } from '../transaction.service';
import { CreateTransactionInput } from '../../dto/create-transaction.input';
import { Transaction } from '../../dto/transaction.type';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TransactionService', () => {
  let service: TransactionService;
  let originalUrl: string | undefined;

  beforeEach(async () => {
    originalUrl = process.env.TRANSACTION_SERVICE_URL;
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalUrl) {
      process.env.TRANSACTION_SERVICE_URL = originalUrl;
    } else {
      delete process.env.TRANSACTION_SERVICE_URL;
    }
  });

  describe('createTransaction', () => {
    const createTransactionInput: CreateTransactionInput = {
      accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
      accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
      transferTypeId: 1,
      value: 100.50,
    };

    const mockTransactionResponse: Transaction = {
      externalId: '123e4567-e89b-12d3-a456-426614174000',
      accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
      accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
      transferTypeId: 1,
      value: 100.50,
      status: 'pending',
      createdAt: new Date(),
    };

    it('should create transaction successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: {
            createTransaction: mockTransactionResponse,
          },
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.createTransaction(createTransactionInput);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://transaction-service:4000/graphql',
        {
          query: expect.stringContaining('mutation CreateTransaction'),
          variables: { input: createTransactionInput },
        },
      );
      expect(result).toEqual(mockTransactionResponse);
    });

    it('should throw HttpException when GraphQL returns errors', async () => {
      // Arrange
      const mockResponse = {
        data: {
          errors: [{ message: 'Invalid input data' }],
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.createTransaction(createTransactionInput)).rejects.toThrow(
        new HttpException('Invalid input data', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException when axios fails', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(service.createTransaction(createTransactionInput)).rejects.toThrow(
        new HttpException(
          'Error communicating with transaction service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should use environment variable for service URL', async () => {
      // Arrange
      process.env.TRANSACTION_SERVICE_URL = 'http://custom-service:4000/graphql';
      const customService = new TransactionService();
      const mockResponse = {
        data: {
          data: {
            createTransaction: mockTransactionResponse,
          },
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      await customService.createTransaction(createTransactionInput);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://custom-service:4000/graphql',
        expect.any(Object),
      );
    });
  });

  describe('getTransaction', () => {
    const externalId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTransactionResponse: Transaction = {
      externalId,
      accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
      accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
      transferTypeId: 1,
      value: 100.50,
      status: 'approved',
      createdAt: new Date(),
    };

    it('should get transaction successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: {
            transaction: mockTransactionResponse,
          },
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.getTransaction(externalId);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://transaction-service:4000/graphql',
        {
          query: expect.stringContaining('query GetTransaction'),
          variables: { externalId },
        },
      );
      expect(result).toEqual(mockTransactionResponse);
    });

    it('should throw HttpException when transaction not found', async () => {
      // Arrange
      const mockResponse = {
        data: {
          errors: [{ message: 'Transaction not found' }],
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.getTransaction(externalId)).rejects.toThrow(
        new HttpException('Transaction not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException when axios fails', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(service.getTransaction(externalId)).rejects.toThrow(
        new HttpException(
          'Error communicating with transaction service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should re-throw HttpException errors', async () => {
      // Arrange
      const customHttpException = new HttpException('Custom error', HttpStatus.BAD_REQUEST);
      mockedAxios.post.mockRejectedValue(customHttpException);

      // Act & Assert
      await expect(service.getTransaction(externalId)).rejects.toThrow(customHttpException);
    });
  });
});