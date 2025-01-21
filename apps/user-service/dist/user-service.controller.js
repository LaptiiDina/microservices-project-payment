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
exports.UserServiceController = void 0;
const common_1 = require("@nestjs/common");
const user_service_service_1 = require("./service/user-service.service");
const microservices_1 = require("@nestjs/microservices");
const get_user_dto_1 = require("./dto/get-user.dto");
const event_dto_1 = require("./dto/event.dto");
let UserServiceController = class UserServiceController {
    constructor(userService) {
        this.userService = userService;
    }
    async createUser(createUserDto) {
        return this.userService.createUser(createUserDto);
    }
    async getUserById(params) {
        return this.userService.getUserById(parseInt(params.id));
    }
    async getAllUsers() {
        return this.userService.getAllUsers();
    }
    async handleOrderPlaced(message) {
        console.log('Received OrderPlaced event:', JSON.stringify(message));
        if (!message.eventId || !message.data?.userId) {
            console.error('Invalid OrderPlaced event format:', message);
            return;
        }
        await this.userService.handleOrderPlaced(message);
    }
    async handleOrderCancelled(message) {
        console.log('Received OrderCancelled event:', JSON.stringify(message));
        if (!message.eventId || !message.data?.userId) {
            console.error('Invalid OrderCancelled event format:', message);
            return;
        }
        await this.userService.handleOrderCancelled(message);
    }
};
exports.UserServiceController = UserServiceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserServiceController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_user_dto_1.GetUserDto]),
    __metadata("design:returntype", Promise)
], UserServiceController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserServiceController.prototype, "getAllUsers", null);
__decorate([
    (0, microservices_1.EventPattern)('order-placed'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.KafkaEventDto]),
    __metadata("design:returntype", Promise)
], UserServiceController.prototype, "handleOrderPlaced", null);
__decorate([
    (0, microservices_1.EventPattern)('order-cancelled'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.KafkaEventDto]),
    __metadata("design:returntype", Promise)
], UserServiceController.prototype, "handleOrderCancelled", null);
exports.UserServiceController = UserServiceController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_service_1.UserService])
], UserServiceController);
//# sourceMappingURL=user-service.controller.js.map