import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { Room } from '../database/entites/room.entity';
import { HotelManagmentController } from './hotel-managment.controller';
import { HotelManagmentService } from './hotel-managment.service';

describe('Test hotel management module', () => {
  let hotelManagmentController: HotelManagmentController;
  let hotelManagmentService: HotelManagmentService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [HotelManagmentController],
      providers: [HotelManagmentService],
    }).compile();

    hotelManagmentController = app.get<HotelManagmentController>(
      HotelManagmentController,
    );
    hotelManagmentService = app.get<HotelManagmentService>(
      HotelManagmentService,
    );
  });

  describe('Get available room', () => {
    it('should return available room', async () => {
      const roomNumber = '99A';
      const args = {
        startDate: '2077-01-20',
        endDate: '2077-02-20',
      };
      try {
        const room = await hotelManagmentService.saveRoom([{ roomNumber }]);

        const result: Room[] = await hotelManagmentController.getAvailableRoom(
          args,
        );

        hotelManagmentService.deleteRoomById(+`${room[0].id}`);

        expect(
          result.find((room) => room.roomNumber == roomNumber).roomNumber,
        ).toBe(roomNumber);
      } catch (e) {
        await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);
        throw e;
      }
    });
  });

  describe('Room booking', () => {
    const roomNumber = '99B';
    const args = {
      startDate: '2077-01-20',
      endDate: '2077-02-20',
      roomId: -1,
    };
    const expectValueForCreate = 'Room was successfully booked';
    const expectValueForNotVacant = "Room is't vacant";
    const expectValueNotExist = "Room doesn't exist";

    try {
      it('should success booking room', async () => {
        await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);

        const room = await hotelManagmentService.saveRoom([{ roomNumber }]);

        args.roomId = +`${room[0].id}`;

        const resultCreate: string = await hotelManagmentController.booking(
          args,
        );

        await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);

        expect(resultCreate).toBe(expectValueForCreate);
      });

      it("should get error when room isn't vacant", async () => {
        try {
          const room = await hotelManagmentService.saveRoom([{ roomNumber }]);

          args.roomId = +`${room[0].id}`;

          await hotelManagmentController.booking(args);

          await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);
        } catch (e) {
          await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);

          expect(e.message).toBe(expectValueForNotVacant);
        }
      });

      it("should get error when room doesn't exist", async () => {
        try {
          await hotelManagmentController.booking(args);
        } catch (e) {
          await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);

          expect(e.message).toBe(expectValueNotExist);
        }
      });
    } catch (e) {
      hotelManagmentService.deleteRoomByRoomNumber(roomNumber);
      throw e;
    }
  });

  describe('Generate report', () => {
    it('should success generate report', async () => {
      const roomNumber = '99A';
      const args = {
        startDate: '2077-01-25',
        endDate: '2077-02-10',
      };
      const expectReport1 = {
        '25': true,
        '26': true,
        '27': true,
        '28': true,
        '29': true,
        '30': true,
        '31': true,
      };
      const expectReport2 = {
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true,
        '6': false,
        '7': false,
        '8': false,
        '9': false,
        '10': false,
      };
      try {
        const room = await hotelManagmentService.saveRoom([{ roomNumber }]);

        await hotelManagmentController.booking({
          startDate: '2077-01-20',
          endDate: '2077-02-05',
          roomId: +`${room[0].id}`,
        });

        const report = await hotelManagmentController.generateReport(args);

        report.forEach((mr, idx) => {
          const roomReport = mr.roomsMetric[`${room[0].id}`];
          if (idx) {
            expect(JSON.stringify(roomReport.occupancyDays)).toBe(
              JSON.stringify(expectReport2),
            );
          } else {
            expect(JSON.stringify(roomReport.occupancyDays)).toBe(
              JSON.stringify(expectReport1),
            );
          }
        });

        hotelManagmentService.deleteRoomById(+`${room[0].id}`);
        expect(false);
      } catch (e) {
        await hotelManagmentService.deleteRoomByRoomNumber(roomNumber);
        throw e;
      }
    });
  });
});
