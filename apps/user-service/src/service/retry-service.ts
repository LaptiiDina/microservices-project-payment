import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaRetriableException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RetryService {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * Executes a task with exception handling.
   * If the task fails, a KafkaRetriableException is thrown for retrying.
   * @param task - The asynchronous task to execute
   * @param dlqTopic - The Dead Letter Queue topic (if the task permanently fails)
   * @param message - The message associated with the task
   */
  async executeTaskWithRetry(
    task: () => Promise<void>,
    dlqTopic: string,
    message: any,
  ): Promise<void> {
    console.log(`Starting task execution with retry. DLQ Topic: ${dlqTopic}, Message:`, message);
    try {
      await task();
      console.log('Task executed successfully.');
    } catch (error) {
      console.error(`Error during task execution: ${error.message}`);

      try {
        if (dlqTopic) {
          console.log('Task failed. Publishing to DLQ...');
          await this.publishToDlq(message, dlqTopic);
        }
      } catch (dlqError) {
        console.error(`Error while publishing to DLQ: ${dlqError.message}`);
      }

      console.error('Throwing KafkaRetriableException.');
      throw new KafkaRetriableException(error.message);
    }
  }

  /**
   * Publishes a message to the Dead Letter Queue.
   * @param message - The message to send to the DLQ
   * @param dlqTopic - The DLQ topic name
   */
  async publishToDlq(message: any, dlqTopic: string): Promise<void> {
    console.log(`Attempting to publish message to DLQ. Topic: ${dlqTopic}, Message:`, message);
    try {
      await lastValueFrom(this.kafkaClient.emit(dlqTopic, message));
      console.log('Message successfully published to DLQ.');
    } catch (error) {
      console.error(`Error while publishing to DLQ: ${error.message}`);
      throw error; // Re-throw the error to propagate it further
    }
  }
}
