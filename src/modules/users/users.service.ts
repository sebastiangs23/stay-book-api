import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { User } from '../../models/users/users.model';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  private sanitizeUser(user: User) {
    const plainUser = user.get({ plain: true });

    delete plainUser.passwordHash;

    return plainUser;
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    return this.sanitizeUser(user);
  }

  async findAll(query: ListUsersQueryDto) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    const where: WhereOptions<User> = {};

    if (query.role) {
      where['role'] = query.role;
    }

    if (query.search) {
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${query.search}%`,
          },
        },
        {
          email: {
            [Op.iLike]: `%${query.search}%`,
          },
        },
      ];
    }

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      attributes: {
        exclude: ['passwordHash'],
      },
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
    const user = await this.userModel.findByPk(id, {
      attributes: {
        exclude: ['passwordHash'],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({
      where: {
        email,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: {
          email: dto.email,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.email !== undefined) {
      user.email = dto.email;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await user.save();

    return this.sanitizeUser(user);
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.destroy();

    return {
      message: 'User deleted successfully',
    };
  }
}
