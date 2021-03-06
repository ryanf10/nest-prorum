import { Inject, Injectable } from '@nestjs/common';
import { FAVORITE_REPOSITORY } from '../../core/constants';
import { Favorite } from './favorite.entity';
import { Post } from './post.entity';
import { Category } from './category.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepository: typeof Favorite,
  ) {}

  async getFavorites(id) {
    return await this.favoriteRepository.findAll({
      where: { user_id: id },
      attributes: [],
      include: {
        model: Post,
        attributes: ['id', 'title', 'description', 'category_id', 'createdAt'],
        include: [{ model: Category }],
      },
    });
  }

  async storeFavorite(user_id, post_id) {
    return await this.favoriteRepository.create({ user_id, post_id });
  }

  async deleteFavorite(user_id, post_id) {
    const post = await this.favoriteRepository.findOne({
      where: { user_id, post_id },
    });
    return await post.destroy();
  }
}
