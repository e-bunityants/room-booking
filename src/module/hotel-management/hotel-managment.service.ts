import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';

import { Room } from '../database/entites/room.entity';
import { Booking } from '../database/entites/booking.entity';

import { RangeDateDTO } from './dtos/range-date.dto';
import { BookingDTO } from './dtos/booking.dto';
import { Report } from './interfaces/report.interface';
import { BookingJ, Metrics, RoomType } from './types';

import {
  castDate,
  castInt,
  generateDate,
  generateDateFullOrPartMonth,
  generateRangOfDate,
} from '../../utils';

@Injectable()
export class HotelManagmentService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  private async getRoomByDate(date: RangeDateDTO): Promise<BookingJ[]> {
    const rooms: BookingJ[] = await this.bookingRepository.query(`
    SELECT rbb.* , r."roomNumber"
    FROM (SELECT * 
      FROM public.bookings as rb 
      WHERE (rb."startDate" BETWEEN ${castDate(date.startDate)} AND ${castDate(
      date.endDate,
    )}
    OR rb."endDate" BETWEEN ${castDate(date.startDate)} AND ${castDate(
      date.endDate,
    )}) 
    OR (rb."startDate" <= ${castDate(date.startDate)}) 
    AND (rb."endDate" >= ${castDate(date.endDate)})) as rbb
    INNER JOIN public.rooms r
    ON rbb."roomId" = r.id;
    `);
    return rooms;
  }

  async saveRoom(saveData: Omit<Room, 'id'>[]) {
    return await this.roomRepository.save(saveData);
  }

  async deleteRoomById(id: number) {
    return await this.roomRepository.delete(id);
  }

  async deleteRoomByRoomNumber(roomNumber: string) {
    return await this.roomRepository.delete({ roomNumber });
  }

  async getVacantRooms(vacantDate: RangeDateDTO) {
    const bookedPeriod = await this.getRoomByDate(vacantDate);

    const excludedRooms = bookedPeriod.map((room) => castInt(room.roomId));

    const vacantRooms: Room[] = await this.roomRepository.query(`
      SELECT * FROM public.rooms ${
        excludedRooms.length
          ? `WHERE public.rooms."id" NOT IN (${excludedRooms.join(', ')})`
          : ''
      };
    `);

    if (!vacantRooms.length) {
      throw new HttpException('Vacant rooms not found', HttpStatus.NOT_FOUND);
    }

    return vacantRooms;
  }

  async booking(bookingData: BookingDTO) {
    const rooms: Room[] = await this.roomRepository.query(
      `SELECT id FROM public.rooms as r WHERE r.id =${bookingData.roomId}`,
    );

    if (!rooms.length) {
      throw new HttpException("Room doesn't exist", HttpStatus.BAD_REQUEST);
    }

    const bookings = await this.getRoomByDate(bookingData);

    const isNotVacant = bookings.find(
      (_booking) => _booking.roomId == bookingData.roomId,
    );

    if (isNotVacant) {
      throw new HttpException("Room is't vacant", HttpStatus.BAD_REQUEST);
    }

    await this.bookingRepository.query(`
      INSERT INTO public.bookings  ("roomId", "startDate", "endDate")
      VALUES 
      (
        (Select id From public.rooms Where id=${bookingData.roomId}),
        ${castDate(bookingData.startDate)},
        ${castDate(bookingData.endDate)}
      )
      `);

    return 'Room was successfully booked';
  }

  async getReport(reportDate: RangeDateDTO): Promise<Report[]> {
    const rangeDate: RangeDateDTO[] = generateRangOfDate(reportDate);
    const startDate = moment(reportDate.startDate);
    const endDate = moment(reportDate.endDate);
    const isOneDay = startDate.isSame(endDate);

    const roomList: RoomType[] = await this.roomRepository.query(
      `SELECT * FROM public.rooms`,
    );

    const resultReport = await rangeDate.reduce<Promise<Report[]>>(
      async (reports, date) => {
        const awaitReport = await reports;
        const start = moment(date.startDate);
        const end = moment(date.endDate);
        const startDayOfMonth = start.date();
        const report: Report = {
          from: date.startDate,
          to: date.endDate,
          roomsMetric: {},
        };

        const bookings = await this.getRoomByDate(date);

        roomList.forEach((room) => {
          const booking = bookings.filter(
            (rb) => rb.roomNumber == room.roomNumber,
          );

          if (booking.length) {
            booking.forEach((bookingOfRoom) => {
              const fromDate = moment(date.startDate);
              const isBeforeStart = moment(bookingOfRoom.startDate).isBefore(
                fromDate,
              );
              const startDate = isBeforeStart
                ? fromDate
                : moment(bookingOfRoom.startDate);

              const diffDay =
                moment(bookingOfRoom.endDate).diff(startDate, 'days') + 1;

              const bookingDays = [...Array(diffDay).keys()].map(
                (day) => day + startDate.date(),
              );

              const reportDays = generateDateFullOrPartMonth(
                startDate,
                date,
                startDayOfMonth,
              );

              const metrics: Metrics = reportDays.reduce((acc, day) => {
                const dayEl = acc[day];

                acc[day] = dayEl ? true : bookingDays.includes(day);
                return acc;
              }, {});

              report.roomsMetric[bookingOfRoom.roomId] = {
                roomNumber: bookingOfRoom.roomNumber,
                occupancyDays: metrics,
              };
            });
          } else {
            let reportDays = [];

            if (!isOneDay) {
              reportDays = generateDate(date, startDayOfMonth);
            } else {
              reportDays = [startDayOfMonth];
            }

            const metrics: Metrics = reportDays.reduce((acc, day) => {
              const dayEl = acc[day];

              acc[day] = !!dayEl;
              return acc;
            }, {});

            report.roomsMetric[room.id] = {
              roomNumber: room.roomNumber,
              occupancyDays: metrics,
            };
          }

          booking.forEach((rb) => {
            const rbStart = moment(rb.startDate);
            const rbEnd = moment(rb.endDate);

            if (rbStart.isBefore(start) && rbEnd.isAfter(end)) {
              const reportDays = generateDateFullOrPartMonth(
                startDate,
                date,
                startDayOfMonth,
              );

              const metrics: Metrics = reportDays.reduce((acc, day) => {
                acc[day] = true;

                return acc;
              }, {});

              report.roomsMetric[room.id] = {
                roomNumber: room.roomNumber,
                occupancyDays: metrics,
              };
            }
          });
        });

        awaitReport.push(report);

        return awaitReport;
      },
      Promise.resolve([]),
    );

    return resultReport;
  }
}
