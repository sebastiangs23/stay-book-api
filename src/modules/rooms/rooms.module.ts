import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Room } from '../../models/rooms/room.model';
import { Reservation } from '../../models/reservations/reservation.model';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [SequelizeModule.forFeature([Room, Reservation])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}