import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import { OrderService } from './service/order-service.service';
import { PrismaService } from './service/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RetryService } from './service/retry-service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['kafka:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [OrderServiceController],
  providers: [OrderService, PrismaService, RetryService],
})
export class OrderServiceModule {}
