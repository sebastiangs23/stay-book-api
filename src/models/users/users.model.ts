import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Reservation } from '../reservations/reservation.model';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(40),
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare passwordHash: string;

  @Column({
    type: DataType.ENUM('GUEST', 'STAFF'),
    allowNull: false,
  })
  declare role: 'GUEST' | 'STAFF';

  @HasMany(() => Reservation)
  declare reservations: Reservation[];
}
