import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'submodule' })
export class Submodule extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare isPrivate: boolean;
}
