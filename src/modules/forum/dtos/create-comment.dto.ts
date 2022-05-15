import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  readonly content: string;

  @IsNotEmpty()
  @IsNumberString()
  readonly post_id: number;
}
