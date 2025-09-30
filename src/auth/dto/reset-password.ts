import { IsEmail, IsString } from "class-validator";
import { PasswordRules } from "../decorators";

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    resetToken: string;

    @PasswordRules()
    newPassword: string;
}