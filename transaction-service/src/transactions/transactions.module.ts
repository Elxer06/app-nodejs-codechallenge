import { Module } from '@nestjs/common';
import { TransactionResolver } from './interfaces/transaction.resolver';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { GetTransactionUseCase } from './application/get-transaction.use-case';
import { UpdateTransactionStatusUseCase } from './application/update-transaction-status.use-case';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository';
import { KafkaService } from './infrastructure/kafka.service';
import { PrismaService } from './infrastructure/prisma.service';
import { TRANSACTION_REPOSITORY, KAFKA_PRODUCER } from '../common/tokens';

@Module({
  providers: [
    // Resolver
    TransactionResolver,
    
    // Use Cases
    CreateTransactionUseCase,
    GetTransactionUseCase,
    UpdateTransactionStatusUseCase,
    
    // Infrastructure
    PrismaService,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: KAFKA_PRODUCER,
      useClass: KafkaService,
    },
    KafkaService,
  ],
  exports: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    UpdateTransactionStatusUseCase,
  ],
})
export class TransactionsModule {}