import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { RangeDateDTO } from './range-date.dto';

export class BookingDTO extends RangeDateDTO {
  @ApiProperty({
    description: 'Room id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  roomId: number;
}
