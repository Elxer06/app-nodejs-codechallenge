import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CreateTransactionInput } from '../dto/create-transaction.input';
import { Transaction } from '../dto/transaction.type';

@Injectable()
export class TransactionService {
  private readonly transactionServiceUrl: string;

  constructor() {
    this.transactionServiceUrl = process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:4000/graphql';
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const mutation = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(input: $input) {
          externalId
          accountExternalIdDebit
          accountExternalIdCredit
          transferTypeId
          value
          status
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await axios.post(this.transactionServiceUrl, {
        query: mutation,
        variables: { input },
      });

      if (response.data.errors) {
        throw new HttpException(
          response.data.errors[0].message,
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data.data.createTransaction;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Error communicating with transaction service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTransaction(externalId: string): Promise<Transaction> {
    const query = `
      query GetTransaction($externalId: String!) {
        transaction(externalId: $externalId) {
          externalId
          accountExternalIdDebit
          accountExternalIdCredit
          transferTypeId
          value
          status
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await axios.post(this.transactionServiceUrl, {
        query,
        variables: { externalId },
      });

      if (response.data.errors) {
        throw new HttpException(
          response.data.errors[0].message,
          HttpStatus.NOT_FOUND,
        );
      }

      return response.data.data.transaction;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Error communicating with transaction service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}