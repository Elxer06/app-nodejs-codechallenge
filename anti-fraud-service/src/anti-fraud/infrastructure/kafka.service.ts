import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { FraudValidationService } from '../services/fraud-validation.service';
import { TransactionCreatedEvent, TransactionStatusUpdatedEvent } from '../interfaces/events.interface';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private readonly fraudValidationService: FraudValidationService) {
    this.kafka = new Kafka({
      clientId: 'anti-fraud-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'anti-fraud-group' });
  }

  async onModuleInit() {
    try {
      console.log('🔧 Anti-Fraud: Intentando conectar a Kafka...');
      await this.producer.connect();
      await this.consumer.connect();
      await this.setupConsumer();
      console.log('🛡️ Anti-Fraud Kafka consumer connected and listening...');
    } catch (error) {
      console.warn('⚠️ Anti-Fraud: Kafka no disponible, funcionando sin mensajería:', error.message);
      // No fallar si Kafka no está disponible
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  private async setupConsumer() {
    try {
      await this.consumer.subscribe({ topic: 'transaction-events' });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = JSON.parse(message.value?.toString() || '{}');
            
            if (event.type === 'transaction-created') {
              await this.handleTransactionCreated(event.data);
            }
          } catch (error) {
            console.error('❌ Error processing Kafka message:', error);
          }
        },
      });
    } catch (error) {
      console.warn('⚠️ Anti-Fraud: No se pudo configurar consumer Kafka:', error.message);
    }
  }

  private async handleTransactionCreated(transaction: TransactionCreatedEvent) {
    console.log(`🔍 Processing transaction: ${transaction.externalId}`);
    
    const status = this.fraudValidationService.validateTransaction(transaction);
    
    const statusUpdateEvent: TransactionStatusUpdatedEvent = {
      externalId: transaction.externalId,
      status,
      updatedAt: new Date(),
    };

    await this.sendTransactionStatusUpdate(statusUpdateEvent);
  }

  private async sendTransactionStatusUpdate(event: TransactionStatusUpdatedEvent) {
    try {
      await this.producer.send({
        topic: 'transaction-events',
        messages: [
          {
            key: event.externalId,
            value: JSON.stringify({
              type: 'transaction-status-updated',
              data: event,
            }),
          },
        ],
      });

      console.log(`📤 Anti-Fraud: Status update sent for transaction ${event.externalId}: ${event.status}`);
    } catch (error) {
      console.warn('⚠️ Anti-Fraud: No se pudo enviar status update:', error.message);
    }
  }
}