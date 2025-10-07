import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase, CreateTransactionDto } from '../create-transaction.use-case';
import { TransactionRepository } from '../transaction.repository';
import { KafkaProducer } from '../kafka-producer.interface';
import { Transaction } from '../../domain/transaction.entity';
import { TRANSACTION_REPOSITORY, KAFKA_PRODUCER } from '../../../common/tokens';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let repository: jest.Mocked<TransactionRepository>;
  let kafkaProducer: jest.Mocked<KafkaProducer>;

  const mockTransactionDto: CreateTransactionDto = {
    accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
    accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
    transferTypeId: 1,
    value: 100.50,
  };

  const mockSavedTransaction = new Transaction(
    '123e4567-e89b-12d3-a456-426614174000',
    mockTransactionDto.accountExternalIdDebit,
    mockTransactionDto.accountExternalIdCredit,
    mockTransactionDto.transferTypeId,
    mockTransactionDto.value,
    'pending',
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository = {
      findByExternalId: jest.fn(),
      save: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockKafkaProducer = {
      sendTransactionCreated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: KAFKA_PRODUCER,
          useValue: mockKafkaProducer,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    repository = module.get(TRANSACTION_REPOSITORY);
    kafkaProducer = module.get(KAFKA_PRODUCER);
  });

  describe('execute', () => {
    it('should create and save a transaction successfully', async () => {
      // Arrange
      repository.save.mockResolvedValue(mockSavedTransaction);
      kafkaProducer.sendTransactionCreated.mockResolvedValue();

      // Act
      const result = await useCase.execute(mockTransactionDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          externalId: '123e4567-e89b-12d3-a456-426614174000',
          accountExternalIdDebit: mockTransactionDto.accountExternalIdDebit,
          accountExternalIdCredit: mockTransactionDto.accountExternalIdCredit,
          transferTypeId: mockTransactionDto.transferTypeId,
          value: mockTransactionDto.value,
          status: 'pending',
        }),
      );
      expect(result).toBe(mockSavedTransaction);
    });

    it('should send Kafka event after saving transaction', async () => {
      // Arrange
      repository.save.mockResolvedValue(mockSavedTransaction);
      kafkaProducer.sendTransactionCreated.mockResolvedValue();

      // Act
      await useCase.execute(mockTransactionDto);

      // Assert
      expect(kafkaProducer.sendTransactionCreated).toHaveBeenCalledWith({
        externalId: mockSavedTransaction.externalId,
        accountExternalIdDebit: mockSavedTransaction.accountExternalIdDebit,
        accountExternalIdCredit: mockSavedTransaction.accountExternalIdCredit,
        transferTypeId: mockSavedTransaction.transferTypeId,
        value: mockSavedTransaction.value,
        status: mockSavedTransaction.status,
        createdAt: mockSavedTransaction.createdAt,
      });
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const error = new Error('Database save error');
      repository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(mockTransactionDto)).rejects.toThrow('Database save error');
      expect(kafkaProducer.sendTransactionCreated).not.toHaveBeenCalled();
    });

    it('should propagate Kafka errors', async () => {
      // Arrange
      repository.save.mockResolvedValue(mockSavedTransaction);
      const kafkaError = new Error('Kafka send error');
      kafkaProducer.sendTransactionCreated.mockRejectedValue(kafkaError);

      // Act & Assert
      await expect(useCase.execute(mockTransactionDto)).rejects.toThrow('Kafka send error');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should create transaction with pending status by default', async () => {
      // Arrange
      repository.save.mockResolvedValue(mockSavedTransaction);
      kafkaProducer.sendTransactionCreated.mockResolvedValue();

      // Act
      const result = await useCase.execute(mockTransactionDto);

      // Assert
      expect(result.status).toBe('pending');
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        }),
      );
    });
  });
});