import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    const post: any = await this.postRepository.findOne({
      attributes: [
        'id',
        'title',
        'description',
        'image',
        'createdAt',
        'category_id',
      ],
      where: { id },
      include: [{ model: Comment }, { model: User }],
    });

    const isFavorited: any = await this.postRepository.findOne({
      attributes: [[sequelize.fn('count', sequelize.col('post_id')), 'jumlah']],
      where: { id },
      include: [
        {
          model: Favorite,
          attributes: [],
          where: { user_id: userId },
        },
      ],
    });

    const { jumlah, ...res } = isFavorited['dataValues'];

    if (jumlah) {
      post.setDataValue('isFavorited', 1);
    } else {
      post.setDataValue('isFavorited', 0);
    }

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

  async storePost(title, description, category_id, path, user_id) {
    return await this.postRepository.create({
      title,
      description,
      category_id,
      image: path,
      user_id,
      deleteableBefore: new Date(new Date().getTime() + 30 * 60 * 1000),
    });
  }

  async updatePost(id, title, description, path) {
    const post = await this.postRepository.findOne({ where: { id } });
    await post.update({ title, description, image: path });
    await post.save();
    return post;
  }

  async deletePost(id, userId) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('post not found');
    }

    const maksTime = new Date(post.deleteableBefore).getTime();
    const now = new Date().getTime();
    if (maksTime < now) {
      throw new BadRequestException('cannot delete now');
    }

    if (post.user_id != userId) {
      throw new UnauthorizedException('you cannot delete this post');
    }

    return await post.destroy();
  }
}
