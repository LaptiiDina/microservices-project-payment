import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RetryService } from './retry-service';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { OrderEventDto } from 'src/dto/order-event.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly retryService: RetryService,
  ) {}

  async processUserCreatedEvent(message: OrderEventDto) {
    console.log('Service: Processing UserCreated event:', JSON.stringify(message));

    if (!message.eventId || !message.data?.userId) {
      console.error('Invalid UserCreated event format:', message);
      throw new BadRequestException('Invalid UserCreated event format');
    }

    await this.retryService.executeTaskWithRetry(
      async () => this.handleUserCreated(message),
      'dead-letter-events',
      message,
    );
  }

  private async handleUserCreated(event: OrderEventDto) {
    console.log('Processing UserCreated event:', event);
  
    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.userCache.upsert({
          where: { userId: event.data.userId },
          update: {},
          create: { userId: event.data.userId },
        });
  
 
        await prisma.processedEvent.create({
          data: { eventId: event.eventId },
        });
      });
  
      console.log('UserCreated event processed successfully.');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('Duplicate event detected at transaction level, skipping...');
      } else {
        console.error('Error processing UserCreated event:', error);
        throw error;
      }
    }
  }
  

  async createOrder(data: { userId: number; product: string; quantity: number }) {
    console.log('Service: Creating order:', data);


    const userExists = await this.prisma.userCache.findUnique({
      where: { userId: data.userId },
    });

    if (!userExists) {
      console.error(`User with ID ${data.userId} does not exist.`);

      const eventId = uuidv4();

   
      await this.retryService.executeTaskWithRetry(
        async () =>
          lastValueFrom(
            this.kafkaClient.emit('dead-letter-events', {
              eventId,
              eventType: 'UserNotFound',
              data: {
                error: `User with ID ${data.userId} does not exist.`,
                orderData: data,
              },
            }),
          ),
        'dead-letter-events',
        { eventId, data: { error: `User with ID ${data.userId} does not exist.`, orderData: data } },
      );

      throw new BadRequestException(`User with ID ${data.userId} does not exist.`);
    }

    
    const order = await this.prisma.order.create({
      data,
    });

    const eventId = uuidv4();


    await this.retryService.executeTaskWithRetry(
      async () =>
        lastValueFrom(
          this.kafkaClient.emit('order-placed', {
            eventId,
            eventType: 'OrderPlaaced',
            data: { orderId: order.id, ...data },
          }),
        ),
      'dead-letter-events',
      { eventId, data: { orderId: order.id, ...data } },
    );

    console.log('OrderPlaced event published successfully:', { eventId, order });

    return order;
  }


  async cancelOrder(orderId: number) {
    console.log('Service: Cancelling order with ID:', orderId);
  
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
  
    if (!order) {
      const eventId = uuidv4();
      console.error('Order not found, publishing to DLQ.');
  
      await this.retryService.executeTaskWithRetry(
        async () =>
          lastValueFrom(
            this.kafkaClient.emit('dead-letter-events', {
              eventId,
              eventType: 'OrderNotFound',
              data: { error: 'Order not found', orderId },
            }),
          ),
        'dead-letter-events',
        { eventId, data: { error: 'Order not found', orderId } },
      );
  
      throw new NotFoundException('Order not found');
    }
  
    await this.prisma.order.delete({
      where: { id: orderId },
    });
  
    const eventId = uuidv4();
  
    await this.retryService.executeTaskWithRetry(
      async () =>
        lastValueFrom(
          this.kafkaClient.emit('order-cancelled', {
            eventId,
            eventType: 'OrderCancelled',
            data: { userId: order.userId, orderId },
          }),
        ),
      'dead-letter-events',
      { eventId, data: { userId: order.userId, orderId } },
    );
  
    console.log('OrderCancelled event published successfully:', { eventId, order });
  
    return { message: `Order with ID ${orderId} has been cancelled` };
  }
  

 
  async getOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      const eventId = uuidv4();
      console.error('Order not found, publishing to DLQ.');

      await this.retryService.executeTaskWithRetry(
        async () =>
          lastValueFrom(
            this.kafkaClient.emit('dead-letter-events', {
              eventId,
              eventType: 'OrderNotFound',
              data: { error: 'Order not found', orderId },
            }),
          ),
        'dead-letter-events',
        { eventId, data: { error: 'Order not found', orderId } },
      );

      throw new NotFoundException('Order not found');
    }

    return order;
  }

 
  async getAllOrders() {
    return this.prisma.order.findMany();
  }

 
  async getOrdersByUserId(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
    });

    if (orders.length === 0) {
      const eventId = uuidv4();
      console.error('No orders found for user, publishing to DLQ.');

      await this.retryService.executeTaskWithRetry(
        async () =>
          lastValueFrom(
            this.kafkaClient.emit('dead-letter-events', {
              eventId,
              eventType: 'UserNotFound',
              data: { error: 'No orders found for user', userId },
            }),
          ),
        'dead-letter-events',
        { eventId, data: { error: 'No orders found for user', userId } },
      );

      throw new NotFoundException('No orders found for this user');
    }

    return orders;
  }
}
