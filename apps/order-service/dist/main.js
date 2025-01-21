"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const order_service_module_1 = require("./order-service.module");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(order_service_module_1.OrderServiceModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                brokers: ['kafka:9092'],
                retry: {
                    retries: 5,
                    initialRetryTime: 300,
                },
            },
            consumer: {
                groupId: 'order-service-consumer',
            },
        },
    });
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                brokers: ['kafka:9092'],
                retry: {
                    retries: 5,
                    initialRetryTime: 500,
                },
            },
            consumer: {
                groupId: 'dlq-consumer',
            },
        },
    });
    app.use(async (req, res, next) => {
        const { topic, message } = req;
        if (topic === 'dead-letter-events') {
            console.error('Message received in DLQ:', message);
        }
        next();
    });
    await app.startAllMicroservices();
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map