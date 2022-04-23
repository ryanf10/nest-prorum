import { Inject, Injectable } from '@nestjs/common';
import { Category } from './category.entity';
import { CATEGORY_REPOSITORY } from '../../core/constants';
import sequelize from 'sequelize';
import { Post } from './post.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: typeof Category,
  ) {}

  async getAll() {
    // return await this.categoryRepository.findAll();
    return await this.categoryRepository.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('count', sequelize.col('posts.id')), 'posts_count'],
      ],
      include: [
        {
          model: Post,
          required: false,
          attributes: [],
        },
      ],
      group: ['Category.id'],
    });
  }

  async getCategoryImage(id) {
    const { icon } = await this.categoryRepository.findOne({
      where: { id },
      attributes: ['icon'],
    });
    return icon;
  }
}
