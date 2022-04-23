import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  DEFAULT_AVATAR = 'public\\img\\avatar.jpg';
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  async profile(@Request() req) {
    const user = await this.userService.profile(req.user.id);
    return { result: { user } };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me/avatar')
  async profileAvatar(@Request() req, @Res() res) {
    const avatar =
      (await this.userService.getAvatar(req.user.id)) ?? this.DEFAULT_AVATAR;
    return res.sendFile(avatar, { root: './' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/me')
  async updateProfile(@Request() req, @Body() body: UpdateUserDto) {
    const user = await this.userService.updateProfile(
      req.user.id,
      body.username,
    );
    return { result: { user } };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/change-password')
  async changePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    await this.userService.changePassword(
      req.user.id,
      body.old_password,
      body.new_password,
    );
    return { messages: 'Password changed successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/change-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './storage/app/public/img/avatars',
        filename(
          req: any,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');

          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
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
  async changeAvatar(@Request() req, @UploadedFile() file) {
    console.log(req.fileValidationError);
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('invalid file');
    }
    await this.userService.changeAvatar(req.user.id, file.path);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('avatar/:id')
  async getAvatar(@Param('id') id, @Res() res) {
    const avatar =
      (await this.userService.getAvatar(id)) ?? this.DEFAULT_AVATAR;
    return res.sendFile(avatar, { root: './' });
  }
}
