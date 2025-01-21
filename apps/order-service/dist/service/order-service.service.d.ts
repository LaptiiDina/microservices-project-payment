import { PrismaService } from './prisma.service';
import { RetryService } from './retry-service';
import { ClientKafka } from '@nestjs/microservices';
import { OrderEventDto } from 'src/dto/order-event.dto';
export declare class OrderService {
    private readonly prisma;
    private readonly kafkaClient;
    private readonly retryService;
    constructor(prisma: PrismaService, kafkaClient: ClientKafka, retryService: RetryService);
    processUserCreatedEvent(message: OrderEventDto): Promise<void>;
    private handleUserCreated;
    createOrder(data: {
        userId: number;
        product: string;
        quantity: number;
    }): Promise<{
        id: number;
        userId: number;
        product: string;
        quantity: number;
    }>;
    cancelOrder(orderId: number): Promise<{
        message: string;
    }>;
    getOrderById(orderId: number): Promise<{
        id: number;
        userId: number;
        product: string;
        quantity: number;
    }>;
    getAllOrders(): Promise<{
        id: number;
        userId: number;
        product: string;
        quantity: number;
    }[]>;
    getOrdersByUserId(userId: number): Promise<{
        id: number;
        userId: number;
        product: string;
        quantity: number;
    }[]>;
}
