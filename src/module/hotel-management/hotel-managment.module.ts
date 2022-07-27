import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HotelManagmentController } from './hotel-managment.controller';
import { HotelManagmentService } from './hotel-managment.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HotelManagmentController],
  providers: [HotelManagmentService],
})
export class HotelManagmentModule {}
