import { Module } from '@nestjs/common';
import { UserServiceController } from './user-service.controller';
import { UserService } from './service/user-service.service';
import { PrismaService } from './service/prisma.service';
import { RetryService } from './service/retry-service';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
  controllers: [UserServiceController],
  providers: [UserService, PrismaService, RetryService],
})
export class UserServiceModule {}
