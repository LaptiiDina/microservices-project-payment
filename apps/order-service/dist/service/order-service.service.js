"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const retry_service_1 = require("./retry-service");
const microservices_1 = require("@nestjs/microservices");
const uuid_1 = require("uuid");
const rxjs_1 = require("rxjs");
let OrderService = class OrderService {
    constructor(prisma, kafkaClient, retryService) {
        this.prisma = prisma;
        this.kafkaClient = kafkaClient;
        this.retryService = retryService;
    }
    async processUserCreatedEvent(message) {
        console.log('Service: Processing UserCreated event:', JSON.stringify(message));
        if (!message.eventId || !message.data?.userId) {
            console.error('Invalid UserCreated event format:', message);
            throw new common_1.BadRequestException('Invalid UserCreated event format');
        }
        await this.retryService.executeTaskWithRetry(async () => this.handleUserCreated(message), 'dead-letter-events', message);
    }
    async handleUserCreated(event) {
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
        }
        catch (error) {
            if (error.code === 'P2002') {
                console.log('Duplicate event detected at transaction level, skipping...');
            }
            else {
                console.error('Error processing UserCreated event:', error);
                throw error;
            }
        }
    }
    async createOrder(data) {
        console.log('Service: Creating order:', data);
        const userExists = await this.prisma.userCache.findUnique({
            where: { userId: data.userId },
        });
        if (!userExists) {
            console.error(`User with ID ${data.userId} does not exist.`);
            const eventId = (0, uuid_1.v4)();
            await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('dead-letter-events', {
                eventId,
                eventType: 'UserNotFound',
                data: {
                    error: `User with ID ${data.userId} does not exist.`,
                    orderData: data,
                },
            })), 'dead-letter-events', { eventId, data: { error: `User with ID ${data.userId} does not exist.`, orderData: data } });
            throw new common_1.BadRequestException(`User with ID ${data.userId} does not exist.`);
        }
        const order = await this.prisma.order.create({
            data,
        });
        const eventId = (0, uuid_1.v4)();
        await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('order-placed', {
            eventId,
            eventType: 'OrderPlaaced',
            data: { orderId: order.id, ...data },
        })), 'dead-letter-events', { eventId, data: { orderId: order.id, ...data } });
        console.log('OrderPlaced event published successfully:', { eventId, order });
        return order;
    }
    async cancelOrder(orderId) {
        console.log('Service: Cancelling order with ID:', orderId);
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            const eventId = (0, uuid_1.v4)();
            console.error('Order not found, publishing to DLQ.');
            await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('dead-letter-events', {
                eventId,
                eventType: 'OrderNotFound',
                data: { error: 'Order not found', orderId },
            })), 'dead-letter-events', { eventId, data: { error: 'Order not found', orderId } });
            throw new common_1.NotFoundException('Order not found');
        }
        await this.prisma.order.delete({
            where: { id: orderId },
        });
        const eventId = (0, uuid_1.v4)();
        await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('order-cancelled', {
            eventId,
            eventType: 'OrderCancelled',
            data: { userId: order.userId, orderId },
        })), 'dead-letter-events', { eventId, data: { userId: order.userId, orderId } });
        console.log('OrderCancelled event published successfully:', { eventId, order });
        return { message: `Order with ID ${orderId} has been cancelled` };
    }
    async getOrderById(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            const eventId = (0, uuid_1.v4)();
            console.error('Order not found, publishing to DLQ.');
            await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('dead-letter-events', {
                eventId,
                eventType: 'OrderNotFound',
                data: { error: 'Order not found', orderId },
            })), 'dead-letter-events', { eventId, data: { error: 'Order not found', orderId } });
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async getAllOrders() {
        return this.prisma.order.findMany();
    }
    async getOrdersByUserId(userId) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
        });
        if (orders.length === 0) {
            const eventId = (0, uuid_1.v4)();
            console.error('No orders found for user, publishing to DLQ.');
            await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('dead-letter-events', {
                eventId,
                eventType: 'UserNotFound',
                data: { error: 'No orders found for user', userId },
            })), 'dead-letter-events', { eventId, data: { error: 'No orders found for user', userId } });
            throw new common_1.NotFoundException('No orders found for this user');
        }
        return orders;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        microservices_1.ClientKafka,
        retry_service_1.RetryService])
], OrderService);
//# sourceMappingURL=order-service.service.js.map