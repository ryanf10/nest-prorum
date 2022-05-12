import { Inject, Injectable } from '@nestjs/common';
import { FAVORITE_REPOSITORY } from '../../core/constants';
import { Favorite } from './favorite.entity';
import { Post } from './post.entity';

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
        attributes: ['id', 'title', 'description', 'category_id'],
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
