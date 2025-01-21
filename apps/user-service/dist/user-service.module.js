"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServiceModule = void 0;
const common_1 = require("@nestjs/common");
const user_service_controller_1 = require("./user-service.controller");
const user_service_service_1 = require("./service/user-service.service");
const prisma_service_1 = require("./service/prisma.service");
const retry_service_1 = require("./service/retry-service");
const microservices_1 = require("@nestjs/microservices");
let UserServiceModule = class UserServiceModule {
};
exports.UserServiceModule = UserServiceModule;
exports.UserServiceModule = UserServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            brokers: ['kafka:9092'],
                        },
                    },
                },
            ]),
        ],
        controllers: [user_service_controller_1.UserServiceController],
        providers: [user_service_service_1.UserService, prisma_service_1.PrismaService, retry_service_1.RetryService],
    })
], UserServiceModule);
//# sourceMappingURL=user-service.module.js.map