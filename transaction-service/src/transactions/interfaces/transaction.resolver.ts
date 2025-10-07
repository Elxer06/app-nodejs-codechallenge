import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { CreateTransactionUseCase } from '../application/create-transaction.use-case';
import { GetTransactionUseCase } from '../application/get-transaction.use-case';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { TransactionType } from './dto/transaction.type';

@Resolver(() => TransactionType)
export class TransactionResolver {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Mutation(() => TransactionType)
  async createTransaction(
    @Args('input') input: CreateTransactionInput,
  ): Promise<TransactionType> {
    const transaction = await this.createTransactionUseCase.execute(input);
    
    return {
      externalId: transaction.externalId,
      accountExternalIdDebit: transaction.accountExternalIdDebit,
      accountExternalIdCredit: transaction.accountExternalIdCredit,
      transferTypeId: transaction.transferTypeId,
      value: transaction.value,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  @Query(() => TransactionType)
  async transaction(
    @Args('externalId') externalId: string,
  ): Promise<TransactionType> {
    const transaction = await this.getTransactionUseCase.execute(externalId);
    
    return {
      externalId: transaction.externalId,
      accountExternalIdDebit: transaction.accountExternalIdDebit,
      accountExternalIdCredit: transaction.accountExternalIdCredit,
      transferTypeId: transaction.transferTypeId,
      value: transaction.value,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}