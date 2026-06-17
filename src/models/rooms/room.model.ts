import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Reservation } from '../reservations/reservation.model';

@Table({ tableName: 'rooms' })
export class Room extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  floor!: number;

  // simple approach (array of URLs)
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  photos!: string[];

  @HasMany(() => Reservation)
  reservations!: Reservation[];
}