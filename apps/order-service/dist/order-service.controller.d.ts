import { OrderService } from './service/order-service.service';
import { OrderEventDto } from './dto/order-event.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';
export declare class OrderServiceController {
    private readonly orderService;
    constructor(orderService: OrderService);
    handleUserCreated(message: OrderEventDto): Promise<void>;
    createOrder(createOrderDto: CreateOrderDto): Promise<{
        id: number;
        userId: number;
        product: string;
        quantity: number;
    }>;
    deleteOrder(params: GetOrderDto): Promise<{
        message: string;
    }>;
    getOrderById(params: GetOrderDto): Promise<{
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
    getOrdersByUserId(params: GetOrderDto): Promise<{
        id: number;
        userId: number;
        product: string;
        quantity: number;
    }[]>;
}
