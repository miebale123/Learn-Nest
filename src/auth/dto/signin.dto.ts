import { IsEmail, IsString } from "class-validator";

export class SignInDto {
  @IsEmail({}, { message: 'email is required' })
  email!: string;

  @IsString({ message: 'password is required' })
  password!: string;
}