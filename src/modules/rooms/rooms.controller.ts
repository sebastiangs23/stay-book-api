import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-rooms.dto';
import { UpdateRoomDto } from './dto/update-rooms.dto';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import { UploadedFile } from '../../types/types';


import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10))
  @Roles('STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateRoomDto, @UploadedFiles() files: UploadedFile[]) {
    return this.roomsService.create(dto, files);
  }

  @Get()
  findAll(@Query() query: ListRoomsQueryDto) {
    return this.roomsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @Roles('STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('photos', 10))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
    @UploadedFiles() files: UploadedFile[],
  ) {
    return this.roomsService.update(id, dto, files);
  }

  @Patch(':id/deactivate')
  @Roles('STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.deactivate(id);
  }

  @Delete(':id')
  @Roles('STAFF')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
}
