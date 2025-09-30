import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, MaxLength, Matches, } from 'class-validator';

export function PasswordRules(min = 8, max = 20) {
  return applyDecorators(
    IsString({ message: 'password is required' }),
    MinLength(min, { message: `password must be at least ${min} characters` }),
    MaxLength(max, { message: `password must be at most ${max} characters` }),
    Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).*$/, {
      message: 'password does not meet our secruity requirements',
    }),
  );
}
