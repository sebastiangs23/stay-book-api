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

import { S3Service } from '../aws/aws.service';

type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
};

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private readonly roomModel: typeof Room,

    @InjectModel(Reservation)
    private readonly reservationModel: typeof Reservation,

    private readonly s3Service: S3Service,
  ) {}

  private parseBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return value === 'true';
    }

    return Boolean(value);
  }

  async create(dto: CreateRoomDto, files: UploadedFile[] = []) {
    try {
      const photoUrls = files.length
        ? await this.s3Service.uploadFiles(files, 'rooms')
        : [];

      return this.roomModel.create({
        name: dto.name,
        description: dto.description,
        price: Number(dto.price),
        floor: Number(dto.floor),
        isActive: this.parseBoolean(dto.isActive) ?? true,
        photos: photoUrls,
      });
    } catch (error) {
      return {
        status: 401,
        message: 'Something went wrong trying to create the room',
        error: error,
      };
    }
  }

  async findAll(query: ListRoomsQueryDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const where: any = {};

    if (query.search?.trim()) {
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${query.search.trim()}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${query.search.trim()}%`,
          },
        },
      ];
    }

    /**
     * Query params arrive as strings from the frontend:
     * /rooms?isActive=true
     *
     * So query.isActive can be "true", not true.
     */
    const parsedIsActive = this.parseBoolean(query.isActive);

    if (parsedIsActive !== undefined) {
      where.isActive = parsedIsActive;
    }

    if (query.checkIn && query.checkOut) {
      const checkIn = new Date(query.checkIn);
      const checkOut = new Date(query.checkOut);

      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        throw new BadRequestException('Invalid checkIn or checkOut date');
      }

      if (checkIn >= checkOut) {
        throw new BadRequestException('checkOut must be after checkIn');
      }

      /**
       * Find reservations that overlap with the requested date range.
       *
       * Existing reservation overlaps when:
       * existing.checkIn < requestedCheckOut
       * AND
       * existing.checkOut > requestedCheckIn
       *
       * This allows:
       * existing checkout = selected check-in
       */
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
        raw: true,
      });

      const unavailableRoomIds = [
        ...new Set(
          unavailableReservations
            .map((reservation: any) => Number(reservation.roomId))
            .filter((roomId) => Number.isInteger(roomId) && roomId > 0),
        ),
      ];

      console.log('checkIn:', checkIn);
      console.log('checkOut:', checkOut);
      console.log('unavailableRoomIds:', unavailableRoomIds);

      /**
       * Very important:
       * Only apply NOT IN if we actually have valid room IDs.
       */
      if (unavailableRoomIds.length > 0) {
        where.id = {
          [Op.notIn]: unavailableRoomIds,
        };
      }

      /**
       * When checking availability, guests should only see active rooms.
       */
      where.isActive = true;
    }

    console.log('rooms where:', where);

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

  async update(id: number, dto: UpdateRoomDto, files: UploadedFile[] = []) {
    try {
      console.log('DTOOOO', dto);
      const room = await this.roomModel.findByPk(id);
      console.log('THE ROOM WAS FOUND', room);

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const previousPhotos = room.photos || [];

      /**
       * Editing image logic:
       *
       * dto.photos should contain the existing photo URLs that the user wants to keep.
       *
       * Example:
       * Existing photos in DB:
       * ["url1", "url2", "url3"]
       *
       * Frontend sends:
       * photos: ["url1", "url3"]
       *
       * Then "url2" is deleted from S3 and removed from DB.
       */
      let finalPhotos = previousPhotos;

      if (dto.photosToKeep !== undefined) {
        finalPhotos = Array.isArray(dto.photosToKeep) ? dto.photosToKeep : [];

        const photosToDelete = previousPhotos.filter(
          (photoUrl) => !finalPhotos.includes(photoUrl),
        );

        if (photosToDelete.length > 0) {
          await this.s3Service.deleteFilesByUrls(photosToDelete);
        }
      }

      /**
       * If new files are uploaded while editing,
       * upload them to S3 and add them to the final photos array.
       */
      if (files.length > 0) {
        console.log('I want to check if its entering here');
        const newPhotoUrls = await this.s3Service.uploadFiles(
          files,
          `rooms/${id}`,
        );
        finalPhotos = [...finalPhotos, ...newPhotoUrls];
      }

      if (dto.name !== undefined) {
        room.name = dto.name;
        console.log('it supposed to change');
      }

      if (dto.description !== undefined) {
        room.description = dto.description;
      }

      if (dto.price !== undefined) {
        room.price = Number(dto.price);
      }

      if (dto.floor !== undefined) {
        room.floor = Number(dto.floor);
      }

      const parsedIsActive = this.parseBoolean(dto.isActive);

      if (parsedIsActive !== undefined) {
        room.isActive = parsedIsActive;
      }

      room.photos = finalPhotos;

      const response = await room.save();
      console.log('is getting updeted', response);

      return room;
    } catch (error) {
      console.log('MISTAKE HERE: ', error);
    }
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

    const photos = room.photos || [];

    if (photos.length > 0) {
      await this.s3Service.deleteFilesByUrls(photos);
    }

    await room.destroy();

    return {
      message: 'Room deleted successfully',
    };
  }
}
