import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.entity';
import { Post } from './post.entity';

@Table
export class Comment extends Model<Comment> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  content: string;

  @ForeignKey(() => Post)
  @Column({ type: DataType.INTEGER, allowNull: false })
  post_id: number;

  @BelongsTo(() => Post)
  post: Post;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @BelongsTo(() => User)
  user: User;
}
