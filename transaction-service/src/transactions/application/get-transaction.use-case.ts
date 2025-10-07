import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../common/tokens';

@Injectable()
export class GetTransactionUseCase {
  constructor(@Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepository) {}

  async execute(externalId: string) {
    const transaction = await this.transactionRepository.findByExternalId(externalId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }
}