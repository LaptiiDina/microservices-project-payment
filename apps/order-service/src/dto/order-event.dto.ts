export class OrderEventDto {
  eventId: string;
  eventType: string;
  userId: number;
  orderId?: number;
  data?: any;
}
