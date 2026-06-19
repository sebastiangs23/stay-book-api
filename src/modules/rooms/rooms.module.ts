import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Room } from '../../models/rooms/room.model';
import { Reservation } from '../../models/reservations/reservation.model';

import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

import { AwsModule } from '../aws/aws.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';

@Module({
  imports: [
    SequelizeModule.forFeature([Room, Reservation]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'temporary-secret',
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),

    AwsModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService, JwtStrategy],
})
export class RoomsModule {}
