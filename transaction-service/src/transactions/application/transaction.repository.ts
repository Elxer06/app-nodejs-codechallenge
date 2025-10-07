import { Transaction } from '../domain/transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findByExternalId(externalId: string): Promise<Transaction | null>;
  updateStatus(externalId: string, status: 'approved' | 'rejected'): Promise<Transaction>;
}