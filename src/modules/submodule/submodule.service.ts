import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Submodule } from '../../models/submodules/submodules.model';
import { ListSubmoduleQueryDto } from './dto/list-submodule-query.dto';
import { CreateSubmoduleDto } from './dto/create-submodule.dto';

@Injectable()
export class SubmoduleService {
  constructor(
    @InjectModel(Submodule)
    private readonly subModuleModel: typeof Submodule,
  ) {}

  async create(dto: CreateSubmoduleDto) {
    return this.subModuleModel.create({
      name: dto.name,
      isActive: dto.isActive ?? false,
      isPrivate: dto.isPrivate,
    });
  }

  async findAll(query: ListSubmoduleQueryDto) {
    const result = await this.subModuleModel.findAll();

    return {
      data: result,
    };
  }
}
