import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Submodule } from 'src/models/submodules/submodules.model';
import { SubmoduleController } from './submodule.controller';
import { SubmoduleService } from './submodule.service';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([Submodule]),

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
  ],
  controllers: [SubmoduleController],
  providers: [SubmoduleService, JwtStrategy],
  exports: [SubmoduleService],
})
export class SubmoduleModule {}
