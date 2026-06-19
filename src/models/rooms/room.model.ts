import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Reservation } from '../reservations/reservation.model';

@Table({
  tableName: 'rooms',
  indexes: [
    {
      name: 'idx_room_name',
      fields: ['name'],
    },
    {
      name: 'idx_room_desc',
      fields: ['description'],
    },
  ],
})
export class Room extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare floor: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  declare photos: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: [],
  })
  declare amenities: string[];

  @HasMany(() => Reservation)
  declare reservations: Reservation[];
}
