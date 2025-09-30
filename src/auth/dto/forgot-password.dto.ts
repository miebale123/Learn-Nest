import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'email is required' })
  email!: string;
}