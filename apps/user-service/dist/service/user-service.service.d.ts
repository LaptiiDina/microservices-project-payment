import { PrismaService } from './prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { RetryService } from './retry-service';
import { KafkaEventDto } from '../dto/event.dto';
export declare class UserService {
    private readonly prisma;
    private readonly kafkaClient;
    private readonly retryService;
    constructor(prisma: PrismaService, kafkaClient: ClientKafka, retryService: RetryService);
    createUser(data: {
        name: string;
        email: string;
    }): Promise<{
        id: number;
        email: string;
        name: string | null;
        totalOrders: number;
    }>;
    getUserById(id: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        totalOrders: number;
    }>;
    getAllUsers(): Promise<{
        id: number;
        email: string;
        name: string | null;
        totalOrders: number;
    }[]>;
    handleOrderPlaced(event: KafkaEventDto): Promise<void>;
    private processOrderPlaced;
    handleOrderCancelled(event: KafkaEventDto): Promise<void>;
    private processOrderCancelled;
}
