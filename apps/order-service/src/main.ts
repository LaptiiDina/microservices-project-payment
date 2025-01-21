import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);



  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], 
        retry: {
          retries: 5,
          initialRetryTime: 300, 
        },
      },
      consumer: {
        groupId: 'order-service-consumer', 
      },
    },
  });


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], 
        retry: {
          retries: 5, 
          initialRetryTime: 500, 
        },
      },
      consumer: {
        groupId: 'dlq-consumer', 
      },
    },
  });


  app.use(async (req: { topic: any; message: any; }, res: any, next: () => void) => {
    const { topic, message } = req;
    if (topic === 'dead-letter-events') {
      console.error('Message received in DLQ:', message);
    }
    next();
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
