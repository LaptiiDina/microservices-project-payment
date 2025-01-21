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
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const microservices_2 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
let RetryService = class RetryService {
    constructor(kafkaClient) {
        this.kafkaClient = kafkaClient;
    }
    async executeTaskWithRetry(task, dlqTopic, message) {
        console.log(`Начало выполнения задачи с ретраем. Топик DLQ: ${dlqTopic}, Сообщение:`, message);
        try {
            await task();
            console.log('Задача выполнена успешно.');
        }
        catch (error) {
            console.error(`Ошибка при выполнении задачи: ${error.message}`);
            try {
                if (dlqTopic) {
                    console.log('Задача не удалась. Публикация в DLQ...');
                    await this.publishToDlq(message, dlqTopic);
                }
            }
            catch (dlqError) {
                console.error(`Ошибка при публикации в DLQ: ${dlqError.message}`);
            }
            console.error('Выбрасывается KafkaRetriableException.');
            throw new microservices_2.KafkaRetriableException(error.message);
        }
    }
    async publishToDlq(message, dlqTopic) {
        console.log(`Попытка публикации сообщения в DLQ. Топик: ${dlqTopic}, Сообщение:`, message);
        try {
            await (0, rxjs_1.lastValueFrom)(this.kafkaClient.emit(dlqTopic, message));
            console.log('Сообщение успешно опубликовано в DLQ.');
        }
        catch (error) {
            console.error(`Ошибка при публикации в DLQ: ${error.message}`);
            throw error;
        }
    }
};
exports.RetryService = RetryService;
exports.RetryService = RetryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], RetryService);
//# sourceMappingURL=retry-service.js.map