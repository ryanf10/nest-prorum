import { Inject, Injectable } from '@nestjs/common';
import {
  ASC,
  CATEGORY,
  CREATED_AT,
  DESC,
  POST_REPOSITORY,
} from '../../core/constants';
import { Post } from './post.entity';
import { Category } from './category.entity';
import { User } from '../users/user.entity';
import { Comment } from './comment.entity';
import { Favorite } from './favorite.entity';
import sequelize from 'sequelize';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: typeof Post,
  ) {}

  async getAll(filter: number, sortBy: string, dir: string) {
    dir = dir == DESC ? DESC : ASC;

    const queryOptions = {
      where: {},
      include: {
        model: Category,
        where: {},
        order: [],
      },
      order: [],
    };

    if (filter) {
      queryOptions.where = { category_id: filter };
      queryOptions.order = [['createdAt', DESC]];
    }

    if (sortBy == CREATED_AT) {
      queryOptions.order = [['createdAt', dir]];
    }

    if (sortBy == CATEGORY) {
      queryOptions.include.order.push(['name', dir]);
      queryOptions.order = [['createdAt', DESC]];
    }

    console.log(queryOptions);

    const posts = await this.postRepository.findAll(queryOptions);
    return posts;
  }

  async getOne(id, userId) {
    const post = await this.postRepository.findOne({
      attributes: [
        'id',
        'title',
        'description',
        'image',
        'createdAt',
        'category_id',
        [sequelize.fn('count', sequelize.col('favorites.id')), 'is_favorited'],
      ],
      where: { id },
      include: [
        { model: Comment },
        { model: User },
        {
          model: Favorite,
          where: { user_id: userId },
          required: false,
          attributes: [],
        },
      ],
    });

    return post;
  }

  async getPostImage(id) {
    const { image } = await this.postRepository.findOne({
      where: { id },
      attributes: ['image'],
    });
    return image;
  }

  async getPostByUser(id) {
    return await this.postRepository.findAll({
      where: { user_id: id },
      include: { model: Category },
    });
  }
}
