import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { SubmoduleService } from './submodule.service';
import { CreateSubmoduleDto } from './dto/create-submodule.dto';
import { ListSubmoduleQueryDto } from './dto/list-submodule-query.dto';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('submodule')
export class SubmoduleController {
  constructor(private readonly submoduleService: SubmoduleService) {}
  @Get()
  findAll(@Query() query: ListSubmoduleQueryDto) {
    return this.submoduleService.findAll(query);
  }

  @Post()
  @Roles('STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateSubmoduleDto) {
    return this.submoduleService.create(dto);
  }
}
