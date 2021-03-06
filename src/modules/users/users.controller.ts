import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
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
import { Buffer } from 'buffer';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

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
  async profileAvatar(@Request() req) {
    const avatar: any = await this.userService.getAvatar(req.user.id);
    const buff = avatar ? Buffer.from(avatar.buffer).toString('base64') : null;
    return { result: buff };
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Patch('/me')
  // async updateProfile(@Request() req, @Body() body: UpdateUserDto) {
  //   const user = await this.userService.updateProfile(
  //     req.user.id,
  //     body.username,
  //   );
  //   return { result: { user } };
  // }

  @Post('/forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const token = await this.userService.forgotPassword(body.email);
    return { result: token };
  }

  @Patch('/reset-password')
  async resetPassword(
    @Request() req,
    @Body() body: ResetPasswordDto,
    @Query('token') token,
  ) {
    await this.userService.resetPassword(token, body.new_password);
    return { messages: 'Password changed successfully' };
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
    // if (!file) {
    //   throw new BadRequestException('invalid file');
    // }
    const buffer = file ? file.buffer : null;
    await this.userService.changeAvatar(req.user.id, buffer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('avatar/:id')
  async getAvatar(@Param('id') id) {
    const avatar: any = await this.userService.getAvatar(id);
    const buff = avatar ? Buffer.from(avatar.buffer).toString('base64') : null;
    return { result: buff };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('info/:id')
  async getInfo(@Param('id') id) {
    const user = await this.userService.info(id);
    return { result: { user } };
  }
}
