import { Module } from '@nestjs/common';
import { FraudValidationService } from './services/fraud-validation.service';
import { KafkaService } from './infrastructure/kafka.service';

@Module({
  providers: [
    FraudValidationService,
    KafkaService,
  ],
})
export class AntiFraudModule {}