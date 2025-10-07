import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { TransactionService } from './services/transaction.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { Transaction } from './dto/transaction.type';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => Transaction)
  async createTransaction(
    @Args('input') input: CreateTransactionInput,
  ): Promise<Transaction> {
    return this.transactionService.createTransaction(input);
  }

  @Query(() => Transaction)
  async transaction(
    @Args('externalId') externalId: string,
  ): Promise<Transaction> {
    return this.transactionService.getTransaction(externalId);
  }
}