import { CATEGORY_REPOSITORY } from '../../core/constants';
import { Category } from './category.entity';

export const categoryProvider = [
  {
    provide: CATEGORY_REPOSITORY,
    useValue: Category,
  },
];
