import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

import { Room } from '../models/rooms/room.model';
import { User } from '../models/users/users.model';
import { Reservation } from '../models/reservations/reservation.model';
import { Submodule } from '../models/submodules/submodules.model';

async function seed() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'StayBook',
    models: [Room, User, Reservation, Submodule],
  });

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    console.log('Database connected.');

    const submodules = [
      {
        name: 'Rooms',
        isActive: true,
        isPrivate: true,
      },
      {
        name: 'Users',
        isActive: false,
        isPrivate: true,
      },
      {
        name: 'Home',
        isActive: true,
        isPrivate: false,
      },
      {
        name: 'Reservations',
        isActive: true,
        isPrivate: false,
      },
    ];

    for (const submodule of submodules) {
      await Submodule.findOrCreate({
        where: { name: submodule.name },
        defaults: submodule,
      });
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    await User.findOrCreate({
      where: { email: 'staff@test.com' },
      defaults: {
        name: 'Staff User',
        email: 'staff@test.com',
        passwordHash,
        role: 'STAFF',
        isActive: true,
      },
    });

    await User.findOrCreate({
      where: { email: 'guest@test.com' },
      defaults: {
        name: 'Guest User',
        email: 'guest@test.com',
        passwordHash,
        role: 'GUEST',
        isActive: true,
      },
    });

    const rooms = Array.from({ length: 20 }).map((_, index) => ({
      name: `Room ${index + 1}`,
      description: `Comfortable room number ${index + 1}`,
      price: 50 + index * 5,
      isActive: true,
      floor: Math.ceil((index + 1) / 5),
      photos: [],
      amenities: ['WiFi', 'TV', 'Air conditioning'],
    }));

    for (const room of rooms) {
      await Room.findOrCreate({
        where: { name: room.name },
        defaults: room,
      });
    }

    console.log('Seeder executed successfully.');
    console.log('Created/verified: 4 submodules, 2 users, and 20 rooms.');

    await sequelize.close();
  } catch (error) {
    console.error('Seeder failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

seed();
