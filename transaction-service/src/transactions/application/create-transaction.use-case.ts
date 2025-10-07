import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { KafkaProducer } from './kafka-producer.interface';
import { Transaction } from '../domain/transaction.entity';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_REPOSITORY, KAFKA_PRODUCER } from '../../common/tokens';

export interface CreateTransactionDto {
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepository,
    @Inject(KAFKA_PRODUCER) private readonly kafkaProducer: KafkaProducer,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = new Transaction(
      uuidv4(),
      dto.accountExternalIdDebit,
      dto.accountExternalIdCredit,
      dto.transferTypeId,
      dto.value,
      'pending',
      new Date(),
    );

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Send event to Kafka
    await this.kafkaProducer.sendTransactionCreated({
      externalId: savedTransaction.externalId,
      accountExternalIdDebit: savedTransaction.accountExternalIdDebit,
      accountExternalIdCredit: savedTransaction.accountExternalIdCredit,
      transferTypeId: savedTransaction.transferTypeId,
      value: savedTransaction.value,
      status: savedTransaction.status,
      createdAt: savedTransaction.createdAt,
    });

    return savedTransaction;
  }
}