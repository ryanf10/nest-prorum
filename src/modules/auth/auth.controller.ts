import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  Res,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response) {
    const { user, token } = await this.authService.login(req.user);
    response.cookie('token', token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      signed: true,
    });

    return { messages: 'Login successful', result: { user } };
  }

  @Post('signup')
  async signUp(
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) response,
  ) {
    const { user, token } = await this.authService.create(body);
    response.cookie('token', token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      signed: true,
    });
    return { messages: 'User created', result: { user } };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response) {
    response.clearCookie('token');
    return {};
  }
}
