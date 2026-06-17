import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Room } from '../../models/rooms/room.model';
import { Reservation } from '../../models/reservations/reservation.model';

import { CreateRoomDto } from './dto/create-rooms.dto';
import { UpdateRoomDto } from './dto/update-rooms.dto';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private readonly roomModel: typeof Room,

    @InjectModel(Reservation)
    private readonly reservationModel: typeof Reservation,
  ) {}

  async create(dto: CreateRoomDto) {
    return this.roomModel.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      floor: dto.floor,
      isActive: dto.isActive ?? true,
      photos: dto.photos ?? [],
    });
  }

  async findAll(query: ListRoomsQueryDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${query.search}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${query.search}%`,
          },
        },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    /**
     * Availability filter:
     * A room is unavailable when there is a confirmed reservation overlapping:
     * existing.checkIn < requestedCheckOut
     * AND existing.checkOut > requestedCheckIn
     *
     * checkout same day as next checkin is allowed.
     */
    if (query.checkIn && query.checkOut) {
      const checkIn = new Date(query.checkIn);
      const checkOut = new Date(query.checkOut);

      if (checkIn >= checkOut) {
        throw new BadRequestException('checkOut must be after checkIn');
      }

      const unavailableReservations = await this.reservationModel.findAll({
        where: {
          status: 'CONFIRMED',
          checkIn: {
            [Op.lt]: checkOut,
          },
          checkOut: {
            [Op.gt]: checkIn,
          },
        },
        attributes: ['roomId'],
      });

      const unavailableRoomIds = unavailableReservations.map(
        (reservation) => reservation.roomId,
      );

      if (unavailableRoomIds.length > 0) {
        where.id = {
          [Op.notIn]: unavailableRoomIds,
        };
      }

      where.isActive = true;
    }

    const { rows, count } = await this.roomModel.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit,
      offset,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number) {
    const room = await this.roomModel.findByPk(id);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: number, dto: UpdateRoomDto) {
    const room = await this.roomModel.findByPk(id);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (dto.name !== undefined) {
      room.name = dto.name;
    }

    if (dto.description !== undefined) {
      room.description = dto.description;
    }

    if (dto.price !== undefined) {
      room.price = dto.price;
    }

    if (dto.floor !== undefined) {
      room.floor = dto.floor;
    }

    if (dto.isActive !== undefined) {
      room.isActive = dto.isActive;
    }

    if (dto.photos !== undefined) {
      room.photos = dto.photos;
    }

    await room.save();

    return room;
  }

  async deactivate(id: number) {
    const room = await this.roomModel.findByPk(id);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    room.isActive = false;
    await room.save();

    return {
      message: 'Room deactivated successfully',
      room,
    };
  }

  async remove(id: number) {
    const room = await this.roomModel.findByPk(id);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await room.destroy();

    return {
      message: 'Room deleted successfully',
    };
  }
}
