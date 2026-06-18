import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, WhereOptions } from 'sequelize';
import { differenceInCalendarDays } from 'date-fns';

import { Reservation } from '../../models/reservations/reservation.model';
import { Room } from '../../models/rooms/room.model';
import { User } from '../../models/users/users.model';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

type PublicReservationStatus = 'UPCOMING' | 'ACTIVE' | 'CANCELLED' | 'PAST';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly sequelize: Sequelize,

    @InjectModel(Reservation)
    private readonly reservationModel: typeof Reservation,

    @InjectModel(Room)
    private readonly roomModel: typeof Room,

    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  private getPublicStatus(reservation: any): PublicReservationStatus {
    if (reservation.status === 'CANCELLED') {
      return 'CANCELLED';
    }

    const now = new Date();
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    if (checkIn > now) {
      return 'UPCOMING';
    }

    if (checkIn <= now && checkOut > now) {
      return 'ACTIVE';
    }

    return 'PAST';
  }

  private serializeReservation(reservation: any) {
    const plainReservation =
      typeof reservation.get === 'function'
        ? reservation.get({ plain: true })
        : reservation;

    return {
      ...plainReservation,

      /**
       * The frontend receives this:
       * UPCOMING | ACTIVE | CANCELLED | PAST
       */
      status: this.getPublicStatus(plainReservation),

      /**
       * Optional: useful for debugging.
       * The database value is usually:
       * CONFIRMED | CANCELLED
       */
      internalStatus: plainReservation.status,
    };
  }

  async createReservation(dto: CreateReservationDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid checkIn or checkOut date');
    }

    if (checkIn >= checkOut) {
      throw new BadRequestException('checkOut must be after checkIn');
    }

    const nights = differenceInCalendarDays(checkOut, checkIn);

    if (nights <= 0) {
      throw new BadRequestException('Reservation must be at least 1 night');
    }

    return this.sequelize.transaction(async (transaction) => {
      await this.sequelize.query('SELECT pg_advisory_xact_lock(:roomId)', {
        replacements: { roomId: dto.roomId },
        transaction,
      });

      const user = await this.userModel.findByPk(dto.userId, { transaction });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const room = await this.roomModel.findByPk(dto.roomId, { transaction });

      if (!room || !room.isActive) {
        throw new NotFoundException('Room not found or inactive');
      }

      const overlappingReservation = await this.reservationModel.findOne({
        where: {
          roomId: dto.roomId,

          /**
           * Internally, only confirmed reservations block room availability.
           */
          status: 'CONFIRMED',

          checkIn: {
            [Op.lt]: checkOut,
          },
          checkOut: {
            [Op.gt]: checkIn,
          },
        },
        transaction,
      });

      if (overlappingReservation) {
        throw new BadRequestException(
          'Room is already booked for the selected dates',
        );
      }

      const totalPrice = Number(room.price) * nights;

      const reservation = await this.reservationModel.create(
        {
          roomId: dto.roomId,
          userId: dto.userId,
          checkIn,
          checkOut,
          totalPrice,

          /**
           * Database value.
           * The frontend will receive UPCOMING or ACTIVE depending on dates.
           */
          status: 'CONFIRMED',

          numberOfGuest: dto.numberOfGuest,
        },
        { transaction },
      );

      return this.serializeReservation(reservation);
    });
  }

  async findAll(query: ListReservationsQueryDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const where: WhereOptions = {};

    if (query.roomId) {
      where['roomId'] = Number(query.roomId);
    }

    if (query.userId) {
      where['userId'] = Number(query.userId);
    }

    if (query.from && query.to) {
      const from = new Date(query.from);
      const to = new Date(query.to);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        throw new BadRequestException('Invalid from or to date');
      }

      if (from >= to) {
        throw new BadRequestException('to must be after from');
      }

      Object.assign(where, {
        checkIn: {
          [Op.lt]: to,
        },
        checkOut: {
          [Op.gt]: from,
        },
      });
    }

    const now = new Date();
    const requestedStatus = query.status?.toUpperCase();

    /**
     * The frontend can send:
     * ?status=CANCELLED
     * ?status=UPCOMING
     * ?status=ACTIVE
     * ?status=PAST
     *
     * But the database stores:
     * CONFIRMED | CANCELLED
     */
    if (requestedStatus === 'CANCELLED') {
      where['status'] = 'CANCELLED';
    }

    if (requestedStatus === 'UPCOMING') {
      where['status'] = 'CONFIRMED';
      where['checkIn'] = {
        [Op.gt]: now,
      };
    }

    if (requestedStatus === 'ACTIVE') {
      where['status'] = 'CONFIRMED';
      where['checkIn'] = {
        [Op.lte]: now,
      };
      where['checkOut'] = {
        [Op.gt]: now,
      };
    }

    if (requestedStatus === 'PAST') {
      where['status'] = 'CONFIRMED';
      where['checkOut'] = {
        [Op.lte]: now,
      };
    }

    const { rows, count } = await this.reservationModel.findAndCountAll({
      where,
      include: [
        {
          model: Room,
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
      order: [['checkIn', 'ASC']],
      limit,
      offset,
    });

    const data = rows.map((reservation) =>
      this.serializeReservation(reservation),
    );

    return {
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number) {
    const reservation = await this.reservationModel.findByPk(id, {
      include: [
        {
          model: Room,
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.serializeReservation(reservation);
  }

  async cancelReservation(id: number) {
    const reservation = await this.reservationModel.findByPk(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    /**
     * Use internal DB status here.
     */
    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('Reservation is already cancelled');
    }

    const now = new Date();
    const checkIn = new Date(reservation.checkIn);

    const diffMs = checkIn.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 24) {
      throw new BadRequestException(
        'You can only cancel a reservation more than 24 hours before check-in',
      );
    }

    await reservation.update({
      status: 'CANCELLED',
    });

    const updatedReservation = await this.findOne(id);

    return {
      message: 'Reservation cancelled successfully',
      reservation: updatedReservation,
    };
  }

  async updateReservation(id: number, dto: UpdateReservationDto) {
    const reservation = await this.reservationModel.findByPk(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    console.log('RESERVATIIIIION', reservation);
    if (reservation.dataValues?.status === 'CANCELLED') {
      throw new BadRequestException('Cannot edit a cancelled reservation');
    }

    const checkIn = dto.checkIn
      ? new Date(dto.checkIn)
      : new Date(reservation?.dataValues.checkIn);

    const checkOut = dto.checkOut
      ? new Date(dto.checkOut)
      : new Date(reservation?.dataValues.checkOut);

    const numberOfGuest = Number(
      dto.numberOfGuest ?? reservation.numberOfGuest,
    );

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid checkIn or checkOut date');
    }

    if (checkIn >= checkOut) {
      throw new BadRequestException('checkOut must be after checkIn');
    }

    if (numberOfGuest < 1 || numberOfGuest > 15) {
      throw new BadRequestException(
        'Number of guests must be between 1 and 15',
      );
    }

    const nights = differenceInCalendarDays(checkOut, checkIn);

    if (nights <= 0) {
      throw new BadRequestException('Reservation must be at least 1 night');
    }

    await this.sequelize.transaction(async (transaction) => {
      await this.sequelize.query('SELECT pg_advisory_xact_lock(:roomId)', {
        replacements: {
          roomId: reservation?.dataValues.roomId,
        },
        transaction,
      });

      const room = await this.roomModel.findByPk(reservation?.dataValues.roomId, {
        transaction,
      });

      if (!room || !room.dataValues.isActive) {
        throw new NotFoundException('Room not found or inactive');
      }

      const overlappingReservation = await this.reservationModel.findOne({
        where: {
          id: {
            [Op.ne]: id,
          },
          roomId: reservation?.dataValues.roomId,
          status: 'CONFIRMED',
          checkIn: {
            [Op.lt]: checkOut,
          },
          checkOut: {
            [Op.gt]: checkIn,
          },
        },
        transaction,
      });

      if (overlappingReservation) {
        throw new BadRequestException(
          'This room is already reserved for the selected dates',
        );
      }

      const totalPrice = Number(room.price) * nights;

      await reservation.update(
        {
          checkIn,
          checkOut,
          numberOfGuest,
          totalPrice,
        },
        { transaction },
      );
    });

    return this.findOne(id);
  }
}
