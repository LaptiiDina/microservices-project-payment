import { UserService } from './service/user-service.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { KafkaEventDto } from './dto/event.dto';
export declare class UserServiceController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(createUserDto: CreateUserDto): Promise<{
        id: number;
        email: string;
        name: string | null;
        totalOrders: number;
    }>;
    getUserById(params: GetUserDto): Promise<{
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
    handleOrderPlaced(message: KafkaEventDto): Promise<void>;
    handleOrderCancelled(message: KafkaEventDto): Promise<void>;
}
