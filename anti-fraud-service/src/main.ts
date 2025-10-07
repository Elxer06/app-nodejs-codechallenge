import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT || 4001;
  await app.listen(port);
  
  console.log(`🛡️  Anti-Fraud Service running on port ${port}`);
}

bootstrap();