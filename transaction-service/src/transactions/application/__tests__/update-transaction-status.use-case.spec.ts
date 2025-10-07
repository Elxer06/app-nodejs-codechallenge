import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionStatusUseCase } from '../update-transaction-status.use-case';
import { TransactionRepository } from '../transaction.repository';
import { Transaction } from '../../domain/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../../../common/tokens';

describe('UpdateTransactionStatusUseCase', () => {
  let useCase: UpdateTransactionStatusUseCase;
  let repository: jest.Mocked<TransactionRepository>;

  const mockTransaction = new Transaction(
    '123e4567-e89b-12d3-a456-426614174000',
    '123e4567-e89b-12d3-a456-426614174001',
    '123e4567-e89b-12d3-a456-426614174002',
    1,
    100.50,
    'approved',
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
        UpdateTransactionStatusUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
    repository = module.get(TRANSACTION_REPOSITORY);
  });

  describe('execute', () => {
    it('should update transaction status to approved', async () => {
      // Arrange
      const externalId = '123e4567-e89b-12d3-a456-426614174000';
      const status = 'approved';
      repository.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(externalId, status);

      // Assert
      expect(repository.updateStatus).toHaveBeenCalledWith(externalId, status);
      expect(result).toBe(mockTransaction);
    });

    it('should update transaction status to rejected', async () => {
      // Arrange
      const externalId = '123e4567-e89b-12d3-a456-426614174000';
      const status = 'rejected';
      const rejectedTransaction = new Transaction(
        externalId,
        '123e4567-e89b-12d3-a456-426614174001',
        '123e4567-e89b-12d3-a456-426614174002',
        1,
        100.50,
        'rejected',
        new Date(),
      );
      repository.updateStatus.mockResolvedValue(rejectedTransaction);

      // Act
      const result = await useCase.execute(externalId, status);

      // Assert
      expect(repository.updateStatus).toHaveBeenCalledWith(externalId, status);
      expect(result).toBe(rejectedTransaction);
      expect(result.status).toBe('rejected');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const externalId = '123e4567-e89b-12d3-a456-426614174000';
      const status = 'approved';
      const error = new Error('Database update error');
      repository.updateStatus.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(externalId, status)).rejects.toThrow('Database update error');
    });
  });
});