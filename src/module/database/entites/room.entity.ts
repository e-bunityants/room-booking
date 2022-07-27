import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  @OneToMany(() => Booking, (booking) => booking.room)
  id: Booking;

  @Column({ unique: true })
  roomNumber: string;
}
