import { Module } from '@nestjs/common';
import { ForumController } from './forum.controller';
import { postsProvider } from './posts.provider';
import { PostsService } from './posts.service';
import { CategoriesService } from './categories.service';
import { categoryProvider } from './category.provider';
import { FavoritesService } from './favorites.service';
import { favoriteProvider } from './favorite.provider';
import { CommentsService } from './comments.service';
import { commentProvider } from './comment.provider';

@Module({
  controllers: [ForumController],
  providers: [
    PostsService,
    CategoriesService,
    FavoritesService,
    CommentsService,
    ...postsProvider,
    ...categoryProvider,
    ...favoriteProvider,
    ...commentProvider,
  ],
})
export class ForumModule {}
