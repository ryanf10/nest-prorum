import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
