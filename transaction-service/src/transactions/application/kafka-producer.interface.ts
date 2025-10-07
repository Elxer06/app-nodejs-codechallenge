export interface KafkaProducer {
  sendTransactionCreated(transaction: any): Promise<void>;
}