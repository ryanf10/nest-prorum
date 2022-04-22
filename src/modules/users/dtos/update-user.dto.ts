import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEnum(Gender, { message: 'gender must be either male or female' })
  gender: string;
}
