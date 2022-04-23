import { POST_REPOSITORY } from '../../core/constants';
import { Post } from './post.entity';

export const postsProvider = [
  {
    provide: POST_REPOSITORY,
    useValue: Post,
  },
];
