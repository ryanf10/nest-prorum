import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../users/user.entity';
import { Post } from './post.entity';

@Table
export class Favorite extends Model<Favorite> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Post)
  @Column({ type: DataType.INTEGER, allowNull: false })
  post_id: number;

  @BelongsTo(() => Post)
  post: Post;
}
