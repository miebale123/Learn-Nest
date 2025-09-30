import { IsString } from "class-validator";
import { PasswordRules } from "../decorators/password-rules.decorator";

export class UpdatePasswordDto {
  @IsString({ message: 'old password required' })
  oldPassword: string;

  @PasswordRules()
  newPassword: string;
}
