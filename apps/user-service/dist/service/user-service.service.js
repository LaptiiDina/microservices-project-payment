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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const microservices_1 = require("@nestjs/microservices");
const retry_service_1 = require("./retry-service");
const uuid_1 = require("uuid");
const rxjs_1 = require("rxjs");
let UserService = class UserService {
    constructor(prisma, kafkaClient, retryService) {
        this.prisma = prisma;
        this.kafkaClient = kafkaClient;
        this.retryService = retryService;
    }
    async createUser(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            const eventId = (0, uuid_1.v4)();
            console.error(`User with email ${data.email} already exists, publishing to DLQ.`);
            await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('dead-letter-events', {
                eventId,
                eventType: 'DuplicateUserEmail',
                data: {
                    error: `User with email ${data.email} already exists.`,
                    name: data.name,
                    email: data.email,
                },
            })), 'dead-letter-events', { eventId, data: { eventType: 'DuplicateUserEmail', name: data.name, email: data.email } });
            throw new common_1.ConflictException(`User with email ${data.email} already exists.`);
        }
        const user = await this.prisma.user.create({
            data: {
                ...data,
                totalOrders: 0,
            },
        });
        const eventId = (0, uuid_1.v4)();
        await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('user-created', {
            eventId,
            eventType: 'UserCreated',
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
            },
        })), 'dead-letter-events', { eventId, data: { eventType: 'UserCreated', userId: user.id, name: user.name, email: user.email } });
        return user;
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            const eventId = (0, uuid_1.v4)();
            console.error('User not found, publishing to DLQ.');
            await this.retryService.executeTaskWithRetry(async () => (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit('dead-letter-events', {
                eventId,
                eventType: 'UserNotFound',
                data: { error: 'User not found', userId: id },
            })), 'dead-letter-events', { eventId, data: { error: 'User not found', userId: id } });
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getAllUsers() {
        return this.prisma.user.findMany();
    }
    async handleOrderPlaced(event) {
        await this.retryService.executeTaskWithRetry(async () => this.processOrderPlaced(event), 'dead-letter-events', event);
    }
    async processOrderPlaced(event) {
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
    async handleOrderCancelled(event) {
        await this.retryService.executeTaskWithRetry(async () => this.processOrderCancelled(event), 'dead-letter-events', event);
    }
    async processOrderCancelled(event) {
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        microservices_1.ClientKafka,
        retry_service_1.RetryService])
], UserService);
//# sourceMappingURL=user-service.service.js.map