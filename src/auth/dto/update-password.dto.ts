import { IsString } from "class-validator";
import { PasswordRules } from "./auth-rules";

export class UpdatePasswordDto {
  @IsString({ message: 'old password required' })
  oldPassword: string;

  @PasswordRules()
  newPassword: string;
}
