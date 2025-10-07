import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../application/transaction.repository';
import { Transaction } from '../domain/transaction.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const saved = await this.prisma.transaction.create({
      data: {
        externalId: transaction.externalId,
        accountExternalIdDebit: transaction.accountExternalIdDebit,
        accountExternalIdCredit: transaction.accountExternalIdCredit,
        transferTypeId: transaction.transferTypeId,
        value: transaction.value,
        status: transaction.status,
      },
    });

    return new Transaction(
      saved.externalId,
      saved.accountExternalIdDebit,
      saved.accountExternalIdCredit,
      saved.transferTypeId,
      saved.value,
      saved.status as 'pending' | 'approved' | 'rejected',
      saved.createdAt,
      saved.updatedAt,
    );
  }

  async findByExternalId(externalId: string): Promise<Transaction | null> {
    const found = await this.prisma.transaction.findUnique({
      where: { externalId },
    });

    if (!found) return null;

    return new Transaction(
      found.externalId,
      found.accountExternalIdDebit,
      found.accountExternalIdCredit,
      found.transferTypeId,
      found.value,
      found.status as 'pending' | 'approved' | 'rejected',
      found.createdAt,
      found.updatedAt,
    );
  }

  async updateStatus(externalId: string, status: 'approved' | 'rejected'): Promise<Transaction> {
    const updated = await this.prisma.transaction.update({
      where: { externalId },
      data: { status },
    });

    return new Transaction(
      updated.externalId,
      updated.accountExternalIdDebit,
      updated.accountExternalIdCredit,
      updated.transferTypeId,
      updated.value,
      updated.status as 'pending' | 'approved' | 'rejected',
      updated.createdAt,
      updated.updatedAt,
    );
  }
}