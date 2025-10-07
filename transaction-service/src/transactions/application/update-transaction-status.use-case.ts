import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../common/tokens';

@Injectable()
export class UpdateTransactionStatusUseCase {
  constructor(@Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepository) {}

  async execute(externalId: string, status: 'approved' | 'rejected') {
    const transaction = await this.transactionRepository.updateStatus(externalId, status);
    return transaction;
  }
}