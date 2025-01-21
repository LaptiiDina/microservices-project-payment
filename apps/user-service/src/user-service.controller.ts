import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './service/user-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { KafkaEventDto } from './dto/event.dto';

@Controller('users')
export class UserServiceController {
  constructor(private readonly userService: UserService) {}


  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

 
  @Get(':id')
  async getUserById(@Param() params: GetUserDto) {
    return this.userService.getUserById(parseInt(params.id));
  }


  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

 
  @EventPattern('order-placed')
  async handleOrderPlaced(@Payload() message: KafkaEventDto) {
    console.log('Received OrderPlaced event:', JSON.stringify(message));

    if (!message.eventId || !message.data?.userId) {
      console.error('Invalid OrderPlaced event format:', message);
      return;
    }


    await this.userService.handleOrderPlaced(message);
  }


  @EventPattern('order-cancelled')
  async handleOrderCancelled(@Payload() message: KafkaEventDto) {
    console.log('Received OrderCancelled event:', JSON.stringify(message));

    if (!message.eventId || !message.data?.userId) {
      console.error('Invalid OrderCancelled event format:', message);
      return;
    }

    
    await this.userService.handleOrderCancelled(message);
  }
}
