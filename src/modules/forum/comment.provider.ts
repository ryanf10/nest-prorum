import { COMMENT_REPOSITORY } from '../../core/constants';
import { Comment } from './comment.entity';

export const commentProvider = [
  {
    provide: COMMENT_REPOSITORY,
    useValue: Comment,
  },
];
