import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { EmailRules, StrictPasswordRules, UsernameRules } from './auth-rules';

export class SignupDto {
  @ValidateIf((o: SignupDto) => !o.email) // username required only if email is missing
  @MinLength(4, { message: 'username must be at least 4 characters' })
  @MaxLength(20, { message: 'username must be at most 20 characters' })
  @Matches(/^(?!_)(?!.*__)[a-zA-Z0-9_]+(?<!_)$/, {
    message:
      'username can only contain letters, numbers, underscores, cannot start/end with underscore, and no consecutive underscores',
  })
  @UsernameRules()
  username?: string;

  @ValidateIf((o: SignupDto) => !o.username) // email required only if username is missing
  @EmailRules()
  email?: string;

  @StrictPasswordRules()
  password!: string;
}

// signup.dto.ts
export class SignInDto {
  @ValidateIf((o: SignInDto) => !o.email) // username required only if email is missing
  @UsernameRules()
  username?: string;

  @ValidateIf((o: SignInDto) => !o.username) // email required only if username is missing
  @EmailRules()
  email?: string;

  @IsString({ message: 'password is required' })
  password!: string;
}

//reset-password

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @StrictPasswordRules()
  newPassword: string;
}


export class ForgotPasswordDto {
  @ValidateIf((o: ForgotPasswordDto) => !o.email)
  @UsernameRules()
  username?: string;

  @ValidateIf((o: ForgotPasswordDto) => !o.username)
  @EmailRules()
  email?: string;
}
