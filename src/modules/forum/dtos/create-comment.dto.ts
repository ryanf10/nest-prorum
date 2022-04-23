import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  readonly content: string;

  @IsNotEmpty()
  @IsNumber()
  readonly post_id: number;
}
