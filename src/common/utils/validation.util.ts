import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const formatValidationErrors = (errors: ValidationError[]) => {
    const formatted = errors.map(err => ({
        field: err.property,
        messages: Object.values(err.constraints || {}),
    }));
    throw new BadRequestException({
        error: 'ValidationError',
        message: formatted,
    });
};
