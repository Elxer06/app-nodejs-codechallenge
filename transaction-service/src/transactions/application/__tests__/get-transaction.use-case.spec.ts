import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionUseCase } from '../get-transaction.use-case';
import { TransactionRepository } from '../transaction.repository';
import { Transaction } from '../../domain/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../../../common/tokens';

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
  let repository: jest.Mocked<TransactionRepository>;

  const mockTransaction = new Transaction(
    '123e4567-e89b-12d3-a456-426614174000',
    '123e4567-e89b-12d3-a456-426614174001',
    '123e4567-e89b-12d3-a456-426614174002',
    1,
    100.50,
    'pending',
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository = {
      findByExternalId: jest.fn(),
      save: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionUseCase>(GetTransactionUseCase);
    repository = module.get(TRANSACTION_REPOSITORY);
  });

  describe('execute', () => {
    it('should return transaction when found', async () => {
      // Arrange
      const externalId = '123e4567-e89b-12d3-a456-426614174000';
      repository.findByExternalId.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(externalId);

      // Assert
      expect(repository.findByExternalId).toHaveBeenCalledWith(externalId);
      expect(result).toBe(mockTransaction);
    });

    it('should throw error when transaction not found', async () => {
      // Arrange
      const externalId = '123e4567-e89b-12d3-a456-426614174000';
      repository.findByExternalId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(externalId)).rejects.toThrow('Transaction not found');
      expect(repository.findByExternalId).toHaveBeenCalledWith(externalId);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const externalId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Database connection error');
      repository.findByExternalId.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(externalId)).rejects.toThrow('Database connection error');
    });
  });
});