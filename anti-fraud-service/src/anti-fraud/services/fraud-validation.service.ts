import { Injectable } from '@nestjs/common';
import { TransactionCreatedEvent } from '../interfaces/events.interface';

@Injectable()
export class FraudValidationService {
  validateTransaction(transaction: TransactionCreatedEvent): 'approved' | 'rejected' {
    // Business rule: transactions with value > 1000 should be rejected
    if (transaction.value > 1000) {
      console.log(`❌ Transaction ${transaction.externalId} REJECTED - Amount: ${transaction.value} > 1000`);
      return 'rejected';
    }

    console.log(`✅ Transaction ${transaction.externalId} APPROVED - Amount: ${transaction.value}`);
    return 'approved';
  }
}