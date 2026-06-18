import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Submodule } from 'src/models/submodules/submodules.model';
import { SubmoduleController } from './submodule.controller';
import { SubmoduleService } from './submodule.service';

@Module({
  imports: [SequelizeModule.forFeature([Submodule])],
  controllers: [SubmoduleController],
  providers: [SubmoduleService],
  exports: [SubmoduleService],
})
export class SubmoduleModule {}
