export interface TransactionCreatedEvent {
  externalId: string;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;
  status: 'pending';
  createdAt: Date;
}

export interface TransactionStatusUpdatedEvent {
  externalId: string;
  status: 'approved' | 'rejected';
  updatedAt: Date;
}