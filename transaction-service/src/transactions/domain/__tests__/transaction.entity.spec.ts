import { Transaction } from '../transaction.entity';

describe('Transaction Entity', () => {
  const mockTransactionData = {
    externalId: '123e4567-e89b-12d3-a456-426614174000',
    accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
    accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
    transferTypeId: 1,
    value: 100.50,
    status: 'pending' as const,
    createdAt: new Date(),
  };

  describe('constructor', () => {
    it('should create a transaction with valid data', () => {
      const transaction = new Transaction(
        mockTransactionData.externalId,
        mockTransactionData.accountExternalIdDebit,
        mockTransactionData.accountExternalIdCredit,
        mockTransactionData.transferTypeId,
        mockTransactionData.value,
        mockTransactionData.status,
        mockTransactionData.createdAt,
      );

      expect(transaction.externalId).toBe(mockTransactionData.externalId);
      expect(transaction.accountExternalIdDebit).toBe(mockTransactionData.accountExternalIdDebit);
      expect(transaction.accountExternalIdCredit).toBe(mockTransactionData.accountExternalIdCredit);
      expect(transaction.transferTypeId).toBe(mockTransactionData.transferTypeId);
      expect(transaction.value).toBe(mockTransactionData.value);
      expect(transaction.status).toBe(mockTransactionData.status);
      expect(transaction.createdAt).toBe(mockTransactionData.createdAt);
    });
  });

  describe('updateStatus', () => {
    it('should update status to approved', () => {
      const transaction = new Transaction(
        mockTransactionData.externalId,
        mockTransactionData.accountExternalIdDebit,
        mockTransactionData.accountExternalIdCredit,
        mockTransactionData.transferTypeId,
        mockTransactionData.value,
        mockTransactionData.status,
        mockTransactionData.createdAt,
      );

      transaction.updateStatus('approved');
      expect(transaction.status).toBe('approved');
    });

    it('should update status to rejected', () => {
      const transaction = new Transaction(
        mockTransactionData.externalId,
        mockTransactionData.accountExternalIdDebit,
        mockTransactionData.accountExternalIdCredit,
        mockTransactionData.transferTypeId,
        mockTransactionData.value,
        mockTransactionData.status,
        mockTransactionData.createdAt,
      );

      transaction.updateStatus('rejected');
      expect(transaction.status).toBe('rejected');
    });
  });

  describe('status checks', () => {
    it('should return true for isPending when status is pending', () => {
      const transaction = new Transaction(
        mockTransactionData.externalId,
        mockTransactionData.accountExternalIdDebit,
        mockTransactionData.accountExternalIdCredit,
        mockTransactionData.transferTypeId,
        mockTransactionData.value,
        'pending',
        mockTransactionData.createdAt,
      );

      expect(transaction.isPending()).toBe(true);
      expect(transaction.isApproved()).toBe(false);
      expect(transaction.isRejected()).toBe(false);
    });

    it('should return true for isApproved when status is approved', () => {
      const transaction = new Transaction(
        mockTransactionData.externalId,
        mockTransactionData.accountExternalIdDebit,
        mockTransactionData.accountExternalIdCredit,
        mockTransactionData.transferTypeId,
        mockTransactionData.value,
        'approved',
        mockTransactionData.createdAt,
      );

      expect(transaction.isPending()).toBe(false);
      expect(transaction.isApproved()).toBe(true);
      expect(transaction.isRejected()).toBe(false);
    });

    it('should return true for isRejected when status is rejected', () => {
      const transaction = new Transaction(
        mockTransactionData.externalId,
        mockTransactionData.accountExternalIdDebit,
        mockTransactionData.accountExternalIdCredit,
        mockTransactionData.transferTypeId,
        mockTransactionData.value,
        'rejected',
        mockTransactionData.createdAt,
      );

      expect(transaction.isPending()).toBe(false);
      expect(transaction.isApproved()).toBe(false);
      expect(transaction.isRejected()).toBe(true);
    });
  });
});