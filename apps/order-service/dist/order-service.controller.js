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
exports.OrderServiceController = void 0;
const common_1 = require("@nestjs/common");
const order_service_service_1 = require("./service/order-service.service");
const microservices_1 = require("@nestjs/microservices");
const order_event_dto_1 = require("./dto/order-event.dto");
const create_order_dto_1 = require("./dto/create-order.dto");
const get_order_dto_1 = require("./dto/get-order.dto");
let OrderServiceController = class OrderServiceController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async handleUserCreated(message) {
        console.log('Controller: Received UserCreated event:', JSON.stringify(message));
        await this.orderService.processUserCreatedEvent(message);
    }
    async createOrder(createOrderDto) {
        console.log('Controller: Creating Order');
        return this.orderService.createOrder(createOrderDto);
    }
    async deleteOrder(params) {
        console.log(`Controller: Deleting Order with ID ${params.id}`);
        return this.orderService.cancelOrder(parseInt(params.id));
    }
    async getOrderById(params) {
        return this.orderService.getOrderById(parseInt(params.id));
    }
    async getAllOrders() {
        return this.orderService.getAllOrders();
    }
    async getOrdersByUserId(params) {
        return this.orderService.getOrdersByUserId(parseInt(params.userId));
    }
};
exports.OrderServiceController = OrderServiceController;
__decorate([
    (0, microservices_1.EventPattern)('user-created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_event_dto_1.OrderEventDto]),
    __metadata("design:returntype", Promise)
], OrderServiceController.prototype, "handleUserCreated", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderServiceController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_order_dto_1.GetOrderDto]),
    __metadata("design:returntype", Promise)
], OrderServiceController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_order_dto_1.GetOrderDto]),
    __metadata("design:returntype", Promise)
], OrderServiceController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderServiceController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_order_dto_1.GetOrderDto]),
    __metadata("design:returntype", Promise)
], OrderServiceController.prototype, "getOrdersByUserId", null);
exports.OrderServiceController = OrderServiceController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_service_1.OrderService])
], OrderServiceController);
//# sourceMappingURL=order-service.controller.js.map