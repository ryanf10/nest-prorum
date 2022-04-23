import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CategoriesService } from './categories.service';
import { FavoritesService } from './favorites.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EditPostDto } from './dtos/edit-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentsService } from './comments.service';
import { Blob, Buffer } from 'buffer';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('forum')
export class ForumController {
  constructor(
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly favoritesService: FavoritesService,
    private readonly commentsService: CommentsService,
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
  async getPostImage(
    @Request() req,
    @Param('id') id,
    @Res({ passthrough: true }) res,
  ) {
    const image: any = await this.postsService.getPostImage(id);
    // const resultku: any = [];
    // const newFile: any = fs.writeFileSync(resultku, image);
    // res.send(new File([image], 'tes.png'));
    // res.sendFile(image, { root: './' });

    // const file = createReadStream(join(process.cwd(), image.buffer));
    // return new StreamableFile(file);
    console.log(image.buffer);

    const buff = Buffer.from(image.buffer).toString('base64');
    console.log(buff);

    // res.send(new StreamableFile(buff));
    return { result: buff };
    // return { result: image.data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('posts/:id')
  async getOnePost(@Request() req, @Param('id') id) {
    const post = await this.postsService.getOne(id, req.user.id);

    return { result: post };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts')
  @UseInterceptors(
    FileInterceptor('image', {
      // storage: diskStorage({
      //   destination: './storage/app/public/img/posts',
      //   filename(
      //     req: any,
      //     file: Express.Multer.File,
      //     callback: (error: Error | null, filename: string) => void,
      //   ) {
      //     const randomName = Array(32)
      //       .fill(null)
      //       .map(() => Math.round(Math.random() * 16).toString(16))
      //       .join('');
      //
      //     return callback(null, `${randomName}${extname(file.originalname)}`);
      //   },
      // }),
      fileFilter(
        req: any,
        file: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination: string;
          filename: string;
          path: string;
          buffer: Buffer;
        },
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          req.fileValidationError = 'Only image files are allowed!';
          callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  async storePost(
    @Request() req,
    @Body() body: CreatePostDto,
    @UploadedFile() file,
  ) {
    const bitmap = file.buffer.toString();
    // console.log(bitmap);
    // convert binary data to base64 encoded string
    // const buffer = new Buffer(file.buffer).toString('base64');
    // console.log(buffer);
    const path = file.buffer;
    const post = await this.postsService.storePost(
      body.title,
      body.description,
      body.category_id,
      path,
      req.user.id,
    );
    return { result: post };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('posts/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      // storage: diskStorage({
      //   destination: './storage/app/public/img/posts',
      //   filename(
      //     req: any,
      //     file: Express.Multer.File,
      //     callback: (error: Error | null, filename: string) => void,
      //   ) {
      //     const randomName = Array(32)
      //       .fill(null)
      //       .map(() => Math.round(Math.random() * 16).toString(16))
      //       .join('');
      //
      //     return callback(null, `${randomName}${extname(file.originalname)}`);
      //   },
      // }),
      fileFilter(
        req: any,
        file: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination: string;
          filename: string;
          path: string;
          buffer: Buffer;
        },
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          req.fileValidationError = 'Only image files are allowed!';
          callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  async updatePost(
    @Request() req,
    @Param('id') id,
    @Body() body: EditPostDto,
    @UploadedFile() file,
  ) {
    const path = file ? file.buffer : null;
    const post = await this.postsService.updatePost(
      id,
      body.title,
      body.description,
      path,
    );
    return { result: post };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('posts/:id')
  async deletePost(@Request() req, @Param('id') id) {
    const post = await this.postsService.deletePost(id, req.user.id);
    // return { result: post };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('comments')
  async storeComment(@Request() req, @Body() body: CreateCommentDto) {
    const comment = await this.commentsService.storeComment(
      body.content,
      body.post_id,
      req.user.id,
    );
    return { result: comment };
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

  @UseGuards(AuthGuard('jwt'))
  @Post('favorites/:post_id')
  async storeFavorite(@Request() req, @Param('post_id') post_id) {
    const posts = await this.favoritesService.storeFavorite(
      req.user.id,
      post_id,
    );
    return { result: posts };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('favorites/:post_id')
  async deleteFavorite(@Request() req, @Param('post_id') post_id) {
    const posts = await this.favoritesService.deleteFavorite(
      req.user.id,
      post_id,
    );
  }
}
