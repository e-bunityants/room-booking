import { Booking } from '../database/entites/booking.entity';
import { Room } from '../database/entites/room.entity';

export type BookingJ = Booking & Omit<Room, 'id'> & { roomId: number };

export type Metrics = Record<string, boolean>;

export type RoomType = Omit<Room, 'id'> & { id: number };
