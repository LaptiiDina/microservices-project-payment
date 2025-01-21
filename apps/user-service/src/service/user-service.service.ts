import { Injectable, NotFoundException, Inject, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { RetryService } from './retry-service';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { KafkaEventDto } from '../dto/event.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly retryService: RetryService,
  ) {}


  async createUser(data: { name: string; email: string }) {

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
  
    if (existingUser) {
      const eventId = uuidv4();
      console.error(`User with email ${data.email} already exists, publishing to DLQ.`);
  
  
      await this.retryService.executeTaskWithRetry(
        async () =>
          lastValueFrom(
            this.kafkaClient.emit('dead-letter-events', {
              eventId,
              eventType: 'DuplicateUserEmail',
              data: {
                error: `User with email ${data.email} already exists.`,
                name: data.name,
                email: data.email,
              },
            }),
          ),
        'dead-letter-events',
        { eventId, data: { eventType: 'DuplicateUserEmail', name: data.name, email: data.email } },
      );
  
      throw new ConflictException(`User with email ${data.email} already exists.`);
    }
  

    const user = await this.prisma.user.create({
      data: {
        ...data,
        totalOrders: 0,
      },
    });
  

    const eventId = uuidv4();
    await this.retryService.executeTaskWithRetry(
      async () =>
        lastValueFrom(
          this.kafkaClient.emit('user-created', {
            eventId,
            eventType: 'UserCreated',
            data: {
              userId: user.id,
              name: user.name,
              email: user.email,
            },
          }),
        ),
      'dead-letter-events',
      { eventId, data: { eventType: 'UserCreated', userId: user.id, name: user.name, email: user.email } },
    );
  
    return user;
  }


  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      const eventId = uuidv4();
      console.error('User not found, publishing to DLQ.');

 
      await this.retryService.executeTaskWithRetry(
        async () =>
          lastValueFrom(
            this.kafkaClient.emit('dead-letter-events', {
              eventId,
              eventType: 'UserNotFound',
              data: { error: 'User not found', userId: id },
            }),
          ),
        'dead-letter-events',
        { eventId, data: { error: 'User not found', userId: id } },
      );

      throw new NotFoundException('User not found');
    }

    return user;
  }


  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async handleOrderPlaced(event: KafkaEventDto) {
    await this.retryService.executeTaskWithRetry(
      async () => this.processOrderPlaced(event),
      'dead-letter-events',
      event,
    );
  }


  private async processOrderPlaced(event:KafkaEventDto) {
    console.log('Processing OrderPlaced event:', event);

    const existingEvent = await this.prisma.processedEvent.findUnique({
      where: { eventId: event.eventId },
    });

    if (existingEvent) {
      console.log('Duplicate OrderPlaced event detected, skipping...');
      return;
    }

    await this.prisma.user.update({
      where: { id: event.data.userId },
      data: {
        totalOrders: { increment: 1 },
      },
    });

    await this.prisma.processedEvent.create({
      data: { eventId: event.eventId },
    });

    console.log('OrderPlaced event processed successfully.');
  }


  async handleOrderCancelled(event: KafkaEventDto) {
    await this.retryService.executeTaskWithRetry(
      async () => this.processOrderCancelled(event),
      'dead-letter-events',
      event,
    );
  }


  private async processOrderCancelled(event: KafkaEventDto) {
    console.log('Processing OrderCancelled event:', event);

    const existingEvent = await this.prisma.processedEvent.findUnique({
      where: { eventId: event.eventId },
    });

    if (existingEvent) {
      console.log('Duplicate OrderCancelled event detected, skipping...');
      return;
    }

    await this.prisma.user.update({
      where: { id: event.data.userId },
      data: {
        totalOrders: { decrement: 1 },
      },
    });

    await this.prisma.processedEvent.create({
      data: { eventId: event.eventId },
    });

    console.log('OrderCancelled event processed successfully.');
  }
}
