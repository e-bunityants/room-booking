import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../module/database/entites/room.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}
  async saveRoom(saveData: Omit<Room, 'id'>[]) {
    await this.roomRepository.save(saveData);
  }
}
