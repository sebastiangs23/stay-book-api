import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { databaseConfig } from './config/database.config';

import { User } from './models/users/users.model';
import { Room } from './models/rooms/room.model';
import { Reservation } from './models/reservations/reservation.model';
import { ReservationsModule } from './modules/reservations/reservation.module';
import { UsersModule } from './modules/users/users.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { SubmoduleModule } from './modules/submodule/submodule.module';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...databaseConfig(configService),
        models: [User, Room, Reservation],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),

    ReservationsModule,
    UsersModule,
    RoomsModule,
    SubmoduleModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
