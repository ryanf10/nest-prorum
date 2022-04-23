import { FAVORITE_REPOSITORY } from '../../core/constants';
import { Favorite } from './favorite.entity';

export const favoriteProvider = [
  {
    provide: FAVORITE_REPOSITORY,
    useValue: Favorite,
  },
];
