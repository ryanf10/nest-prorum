import { Inject, Injectable } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '../../core/constants';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentReposistory: typeof Comment,
  ) {}

  async storeComment(content, post_id, user_id) {
    return await this.commentReposistory.create({ content, post_id, user_id });
  }
}
