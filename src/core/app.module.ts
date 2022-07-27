import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/module/database/database.module';
import { HotelManagmentModule } from 'src/module/hotel-management/hotel-managment.module';

@Module({
  imports: [DatabaseModule, HotelManagmentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
