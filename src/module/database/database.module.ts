import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entites/booking.entity';
import * as dotenv from 'dotenv';
import { Room } from './entites/room.entity';

// load .env file
dotenv.config({ path: `.env` });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWD,
      database: process.env.DATABASE_NAME,
      entities: [`${__dirname}../../**/*.entity.ts`],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Room, Booking]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
