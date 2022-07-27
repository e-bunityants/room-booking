import { NestFactory } from '@nestjs/core';
import { SeederModule } from '../seeder.module';
import { SeederService } from '../seeder.service';

async function bootstrap() {
  NestFactory.create(SeederModule)
    .then((appContext) => {
      const seeder = appContext.get(SeederService);
      seeder.saveRoom([
        { roomNumber: '1A' },
        { roomNumber: '1B' },
        { roomNumber: '2A' },
        { roomNumber: '2B' },
        { roomNumber: '3A' },
        { roomNumber: '3B' },
        { roomNumber: '4A' },
        { roomNumber: '4B' },
      ]);
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
