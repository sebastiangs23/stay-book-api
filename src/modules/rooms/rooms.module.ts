import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Room } from '../../models/rooms/room.model';
import { Reservation } from '../../models/reservations/reservation.model';

import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [SequelizeModule.forFeature([Room, Reservation]), AwsModule],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
