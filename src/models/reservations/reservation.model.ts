import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Room } from '../rooms/room.model';

@Table({
  tableName: 'reservations',
  indexes: [
    {
      name: 'idx_reservations_room_dates',
      fields: ['roomId', 'checkIn', 'checkOut'],
    },
    {
      name: 'idx_reservations_user',
      fields: ['userId'],
    },
    {
      name: 'idx_reservations_status',
      fields: ['status'],
    },
  ],
})
export class Reservation extends Model {
  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  roomId!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => Room)
  room!: Room;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  checkIn!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  checkOut!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice!: number;
  //TODO
  @Column({
    type: DataType.ENUM('ACTIVE', 'CANCELLED', 'UPCOMING'),
    allowNull: false,
    defaultValue: 'CONFIRMED',
  })
  status!: 'ACTIVE' | 'CANCELLED' | 'UPCOMING';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  numberOfGuest!: number;
}
