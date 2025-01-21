
export class KafkaEventDto {
  eventId: string;
  eventType: string;
  userId?: number;
  error?: string;
  data?: any;
}
