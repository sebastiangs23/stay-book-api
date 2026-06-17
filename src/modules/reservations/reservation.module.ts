import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Reservation } from '../../models/reservations/reservation.model';
import { Room } from '../../models/rooms/room.model';
import { User } from '../../models/users/users.model';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservation.service';

@Module({
  imports: [SequelizeModule.forFeature([Reservation, Room, User])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}