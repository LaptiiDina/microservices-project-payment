import { ClientKafka } from '@nestjs/microservices';
export declare class RetryService {
    private readonly kafkaClient;
    constructor(kafkaClient: ClientKafka);
    executeTaskWithRetry(task: () => Promise<void>, dlqTopic: string, message: any): Promise<void>;
    publishToDlq(message: any, dlqTopic: string): Promise<void>;
}
