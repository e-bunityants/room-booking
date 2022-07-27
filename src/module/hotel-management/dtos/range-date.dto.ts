import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsFormatDate } from '../../../decorators/is-format-date';
import { IsGrateOrEqualThenDate } from '../../../decorators/is-grate-or-equal-then-date';

export class RangeDateDTO {
  @ApiProperty({
    description: 'Date in format YYYY-MM-DD',
    example: '2022-10-10',
  })
  @IsNotEmpty()
  @IsFormatDate('YYYY-MM-DD')
  startDate: string;

  @ApiProperty({
    description: 'Date in format YYYY-MM-DD',
    example: '2022-11-10',
  })
  @IsNotEmpty()
  @IsGrateOrEqualThenDate('startDate')
  @IsFormatDate('YYYY-MM-DD')
  endDate: string;
}
