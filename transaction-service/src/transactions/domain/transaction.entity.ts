export class Transaction {
  constructor(
    public readonly externalId: string,
    public readonly accountExternalIdDebit: string,
    public readonly accountExternalIdCredit: string,
    public readonly transferTypeId: number,
    public readonly value: number,
    public status: 'pending' | 'approved' | 'rejected',
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
  ) {}

  updateStatus(newStatus: 'approved' | 'rejected'): void {
    this.status = newStatus;
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isApproved(): boolean {
    return this.status === 'approved';
  }

  isRejected(): boolean {
    return this.status === 'rejected';
  }
}