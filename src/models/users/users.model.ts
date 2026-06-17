import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Reservation } from '../reservations/reservation.model';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(40),
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwordHash: string;

  @Column({
    type: DataType.ENUM('GUEST', 'STAFF'),
    allowNull: false,
  })
  role: 'GUEST' | 'STAFF';

  @HasMany(() => Reservation)
  reservations: Reservation[];
}