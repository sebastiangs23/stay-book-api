import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  dialect: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: Number(configService.get<string>('DB_PORT', '5432')),
  username: configService.get<string>('DB_USER', 'postgres'),
  password: configService.get<string>('DB_PASS', ''),
  database: configService.get<string>('DB_NAME', 'staybook'),
  autoLoadModels: true,
  synchronize: true,
});