import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { PasswordRules } from "./auth-rules";

export class SignupDto {
  @Transform(
    ({ value }) =>
      typeof value === 'string' ? value.toLowerCase().trim() : undefined,
    { toClassOnly: true },
  )
  @IsEmail({}, { message: 'enter a valid email' })
  email!: string;

  @PasswordRules()
  password!: string;
}