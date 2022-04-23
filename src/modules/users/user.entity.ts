import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Post } from '../forum/post.entity';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({ type: DataType.BLOB })
  avatar: string;

  @HasMany(() => Post)
  posts: Post;
}
