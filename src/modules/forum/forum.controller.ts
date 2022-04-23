import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CategoriesService } from './categories.service';
import { FavoritesService } from './favorites.service';

@Controller('forum')
export class ForumController {
  constructor(
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly favoritesService: FavoritesService,
  ) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('posts/')
  async getAllPosts(@Query() query) {
    const posts = await this.postsService.getAll(
      query.category,
      query.sortBy,
      query.dir,
    );
    return { result: posts };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('posts/user/:id')
  async getPostByUser(@Param('id') id) {
    const post = await this.postsService.getPostByUser(id);
    return { result: post };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('posts/:id/image')
  async getPostImage(@Request() req, @Param('id') id, @Res() res) {
    const image = await this.postsService.getPostImage(id);
    res.sendFile(image, { root: './' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('posts/:id')
  async getOnePost(@Request() req, @Param('id') id) {
    const post = await this.postsService.getOne(id, req.user.id);
    return { result: post };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('categories')
  async getAllCategories() {
    const categories = await this.categoriesService.getAll();
    return { result: categories };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('categories/:id/image')
  async getCategoryImage(@Request() req, @Param('id') id, @Res() res) {
    const image = await this.categoriesService.getCategoryImage(id);
    res.sendFile(image, { root: './' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('favorites')
  async getFavorites(@Request() req) {
    const posts = await this.favoritesService.getFavorites(req.user.id);
    return { result: posts };
  }
}
