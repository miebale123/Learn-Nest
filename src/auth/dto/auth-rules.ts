// utils/decorators.ts
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export function UsernameRules() {
  return applyDecorators(
    IsOptional(),
    Transform(
      ({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : undefined,
      { toClassOnly: true },
    ),
    IsString({ message: 'enter a valid username' }),
  );
}

export function EmailRules() {
  return applyDecorators(
    IsOptional(),
    Transform(
      ({ value }) =>
        typeof value === 'string' ? value.toLowerCase().trim() : undefined,
      { toClassOnly: true },
    ),
    IsEmail({}, { message: 'enter a valid email' }),
  );
}

export function StrictPasswordRules(min = 8, max = 20) {
  return applyDecorators(
    IsString({ message: 'password is required' }),
    MinLength(min, { message: `password must be at least ${min} characters` }),
    MaxLength(max, { message: `password must be at most ${max} characters` }),
    Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).*$/, {
      message: 'password does not meet secruity requirements',
    })

  );
}
