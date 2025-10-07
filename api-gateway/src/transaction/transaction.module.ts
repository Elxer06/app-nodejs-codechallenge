import { Module } from '@nestjs/common';
import { TransactionResolver } from './transaction.resolver';
import { TransactionService } from './services/transaction.service';

@Module({
  providers: [TransactionResolver, TransactionService],
})
export class TransactionModule {}