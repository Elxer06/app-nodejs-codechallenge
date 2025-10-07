import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { KafkaProducer } from '../application/kafka-producer.interface';
import { UpdateTransactionStatusUseCase } from '../application/update-transaction-status.use-case';
import { TRANSACTION_REPOSITORY, KAFKA_PRODUCER } from '../../common/tokens';

@Injectable()
export class KafkaService implements KafkaProducer, OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase
  ) {
    const kafkaBroker = process.env.KAFKA_BROKER || 'kafka:9092';
    console.log('🔧 Kafka Configuration:', { 
      broker: kafkaBroker,
      env_KAFKA_BROKER: process.env.KAFKA_BROKER,
      all_env: process.env 
    });
    
    this.kafka = new Kafka({
      clientId: 'transaction-service',
      brokers: [kafkaBroker],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'transaction-service-group' });
  }

  async onModuleInit() {
    try {
      console.log('🔧 Intentando conectar a Kafka...');
      await this.producer.connect();
      await this.consumer.connect();
      await this.setupConsumer();
      console.log('✅ Kafka conectado exitosamente');
    } catch (error) {
      console.warn('⚠️ Kafka no disponible, funcionando sin mensajería:', error.message);
      // No fallar si Kafka no está disponible
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async sendTransactionCreated(transaction: any): Promise<void> {
    try {
      await this.producer.send({
        topic: 'transaction-events',
        messages: [
          {
            key: transaction.externalId,
            value: JSON.stringify({
              type: 'transaction-created',
              data: transaction,
            }),
          },
        ],
      });
      console.log('📤 Evento de transacción enviado a Kafka');
    } catch (error) {
      console.warn('⚠️ No se pudo enviar evento a Kafka:', error.message);
      // No fallar la transacción por problemas con Kafka
    }
  }

  private async setupConsumer() {
    await this.consumer.subscribe({ topic: 'transaction-events' });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          
          if (event.type === 'transaction-status-updated') {
            console.log('📥 Status update recibido:', event.data);
            
            try {
              // Actualizar el status de la transacción usando el use case
              await this.updateTransactionStatusUseCase.execute(
                event.data.externalId,
                event.data.status
              );
              
              console.log('✅ Status de transacción actualizado exitosamente:', {
                externalId: event.data.externalId,
                newStatus: event.data.status
              });
            } catch (error) {
              console.error('❌ Error actualizando status de transacción:', error);
            }
          }
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      },
    });
  }
}