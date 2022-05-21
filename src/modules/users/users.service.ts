import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { USER_REPOSITORY } from '../../core/constants';
import * as bcrypt from 'bcrypt';
import { Post } from '../forum/post.entity';
import sequelize from 'sequelize';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    return await this.userRepository.create<User>(user);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { email } });
  }

  async findOneByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { username } });
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOne<User>({ where: { id } });
  }

  async profile(id: number): Promise<User> {
    const user = await this.userRepository.findOne<User>({
      attributes: [
        'id',
        'username',
        'email',
        [sequelize.fn('count', sequelize.col('posts.id')), 'posts_count'],
      ],
      where: { id },
      include: { model: Post, attributes: [] },
      group: ['User.id'],
    });
    return this.userResponse(user);
  }

  async info(id: number): Promise<User> {
    const user = await this.userRepository.findOne<User>({
      attributes: [
        'id',
        'username',
        'email',
        [sequelize.fn('count', sequelize.col('posts.id')), 'posts_count'],
      ],
      where: { id },
      include: { model: Post, attributes: [] },
      group: ['User.id'],
    });
    const { avatar, password, email, ...result } = user['dataValues'];
    return result;
  }

  async updateProfile(id: number, username: string): Promise<User> {
    const user = await this.findOneById(id);
    await user.update({ username });
    await user.save();
    return this.userResponse(user);
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.findOneById(id);
    const match = await this.comparePassword(oldPassword, user.password);
    if (!match) {
      throw new ForbiddenException(
        'old password does not match with our record',
      );
    }

    const password = await this.hashPassword(newPassword);
    await user.update({ password });
    await user.save();
  }

  async changeAvatar(id: number, avatar: string) {
    const user = await this.findOneById(id);
    await user.update({ avatar });
    await user.save();
  }

  async getAvatar(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user.avatar;
  }

  userResponse(user) {
    const { password, avatar, ...result } = user['dataValues'];
    return result;
  }

  async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }

  async forgotPassword(email: string) {
    const user = await this.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User Not found');
    }

    user.reset_token = this.makeResetToken(36);
    await user.save();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: 'Prorum <noreply@prorum.vercel.app>', // sender address
      to: user.email, // list of receivers
      subject: 'Password reset', // Subject line
      text: '', // plain text body
      html: `Your reset token is<br>
             <h3><b>${user.reset_token}</b></h3>
             <a href="https://prorum.vercel.app/reset/${user.reset_token}"><h3>Please click this link</h3></a>
             `, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return { token: user.reset_token };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne<User>({
      where: { reset_token: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid token');
    }

    const password = await this.hashPassword(newPassword);
    await user.update({ password, reset_token: null });
    await user.save();
  }

  private makeResetToken(length): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
