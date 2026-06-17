import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ReservationsService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  createReservation(@Body() dto: CreateReservationDto) {
    return this.reservationsService.createReservation(dto);
  }

  @Get()
  findAll(@Query() query: ListReservationsQueryDto) {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancelReservation(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancelReservation(id);
  }
}