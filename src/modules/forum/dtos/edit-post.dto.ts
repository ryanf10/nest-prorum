import { IsNotEmpty, IsEmail } from 'class-validator';

export class EditPostDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly description: string;
}
