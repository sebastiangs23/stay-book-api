import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { SubmoduleService } from './submodule.service';
import { CreateSubmoduleDto } from './dto/create-submodule.dto';
import { ListSubmoduleQueryDto } from './dto/list-submodule-query.dto';

@Controller('submodule')
export class SubmoduleController {
  constructor(private readonly submoduleService: SubmoduleService) {}
  @Get()
  findAll(@Query() query: ListSubmoduleQueryDto) {
    return this.submoduleService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateSubmoduleDto) {
    return this.submoduleService.create(dto);
  }
}
