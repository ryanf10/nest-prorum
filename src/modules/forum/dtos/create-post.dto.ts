import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsInt,
  IsNumberString,
} from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly description: string;

  @IsNotEmpty()
  @IsNumberString()
  readonly category_id: number;
}
