import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './post.entity';

@Table
export class Category extends Model<Category> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  icon: string;

  @HasMany(() => Post)
  posts: Post[];
}
