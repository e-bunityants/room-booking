import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HotelManagmentService } from './hotel-managment.service';

import { RangeDateDTO } from './dtos/range-date.dto';
import { BookingDTO } from './dtos/booking.dto';
import { Report } from './interfaces/report.interface';

@Controller('managment')
export class HotelManagmentController {
  constructor(private readonly hotelManagmentService: HotelManagmentService) {}

  @ApiOperation({ description: 'Get available Room in range date' })
  @Post('available')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Return array of rooms' })
  getAvailableRoom(@Body() roomDate: RangeDateDTO) {
    try {
      return this.hotelManagmentService.getVacantRooms(roomDate);
    } catch (error) {
      return error;
    }
  }

  @ApiOperation({ description: 'Booking room in range date' })
  @Post('book')
  @ApiResponse({
    status: 201,
    description: 'Return message about booking room',
  })
  booking(@Body() bookDate: BookingDTO) {
    try {
      return this.hotelManagmentService.booking(bookDate);
    } catch (error) {
      return error;
    }
  }

  @ApiOperation({
    description: 'Create report in range date',
  })
  @Post('report')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description:
      'Array of reports sorted by month where field "occupancy" is array of day occupancy',
  })
  generateReport(@Body() reportDate: RangeDateDTO): Promise<Report[]> {
    try {
      return this.hotelManagmentService.getReport(reportDate);
    } catch (error) {
      return error;
    }
  }
}
