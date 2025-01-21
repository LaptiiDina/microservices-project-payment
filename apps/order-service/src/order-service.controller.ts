import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { OrderService } from './service/order-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderEventDto } from './dto/order-event.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';

@Controller('orders')
export class OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern('user-created')
  async handleUserCreated(@Payload() message: OrderEventDto) {
    console.log('Controller: Received UserCreated event:', JSON.stringify(message));
    await this.orderService.processUserCreatedEvent(message);
  }


  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    console.log('Controller: Creating Order');
    return this.orderService.createOrder(createOrderDto);
  }


  @Delete(':id')
  async deleteOrder(@Param() params: GetOrderDto) {
    console.log(`Controller: Deleting Order with ID ${params.id}`);
    
    return this.orderService.cancelOrder(parseInt(params.id));
  }


  @Get(':id')
  async getOrderById(@Param() params: GetOrderDto) {
    return this.orderService.getOrderById(parseInt(params.id));
  }


  @Get()
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('user/:userId')
  async getOrdersByUserId(@Param() params: GetOrderDto) {
    return this.orderService.getOrdersByUserId(parseInt(params.userId));
  }
}
