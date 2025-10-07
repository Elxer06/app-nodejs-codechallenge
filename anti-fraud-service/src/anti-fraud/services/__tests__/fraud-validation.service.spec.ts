import { Test, TestingModule } from '@nestjs/testing';
import { FraudValidationService } from '../fraud-validation.service';
import { TransactionCreatedEvent } from '../../interfaces/events.interface';

describe('FraudValidationService', () => {
  let service: FraudValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FraudValidationService],
    }).compile();

    service = module.get<FraudValidationService>(FraudValidationService);
  });

  describe('validateTransaction', () => {
    it('should approve transaction with value <= 1000', () => {
      // Arrange
      const transaction: TransactionCreatedEvent = {
        externalId: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 1000,
        status: 'pending',
        createdAt: new Date(),
      };

      // Act
      const result = service.validateTransaction(transaction);

      // Assert
      expect(result).toBe('approved');
    });

    it('should approve transaction with value < 1000', () => {
      // Arrange
      const transaction: TransactionCreatedEvent = {
        externalId: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 999.99,
        status: 'pending',
        createdAt: new Date(),
      };

      // Act
      const result = service.validateTransaction(transaction);

      // Assert
      expect(result).toBe('approved');
    });

    it('should reject transaction with value > 1000', () => {
      // Arrange
      const transaction: TransactionCreatedEvent = {
        externalId: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 1000.01,
        status: 'pending',
        createdAt: new Date(),
      };

      // Act
      const result = service.validateTransaction(transaction);

      // Assert
      expect(result).toBe('rejected');
    });

    it('should reject transaction with much higher value', () => {
      // Arrange
      const transaction: TransactionCreatedEvent = {
        externalId: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 5000,
        status: 'pending',
        createdAt: new Date(),
      };

      // Act
      const result = service.validateTransaction(transaction);

      // Assert
      expect(result).toBe('rejected');
    });

    it('should approve transaction with minimum value', () => {
      // Arrange
      const transaction: TransactionCreatedEvent = {
        externalId: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 0.01,
        status: 'pending',
        createdAt: new Date(),
      };

      // Act
      const result = service.validateTransaction(transaction);

      // Assert
      expect(result).toBe('approved');
    });

    it('should approve transaction with zero value', () => {
      // Arrange
      const transaction: TransactionCreatedEvent = {
        externalId: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        transferTypeId: 1,
        value: 0,
        status: 'pending',
        createdAt: new Date(),
      };

      // Act
      const result = service.validateTransaction(transaction);

      // Assert
      expect(result).toBe('approved');
    });
  });
});