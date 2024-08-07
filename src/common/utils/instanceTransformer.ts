import { BadRequestException } from '@nestjs/common'
import { ClassTransformOptions, plainToClass } from 'class-transformer'
import {
  validateSync,
  ValidationError,
  ValidatorOptions
} from 'class-validator'

export declare type ClassConstructor<T> = {
  new (...args: any[]): T
}

export function instanceTransformer<T extends object>(
  Class: ClassConstructor<T>,
  obj: unknown,
  transformerOptions?: ClassTransformOptions | undefined,
  validatorOptions?: ValidatorOptions | undefined
) {
  const instance = plainToClass(Class, obj, {
    excludeExtraneousValues: true,
    ...transformerOptions
  })
  const errors = validateSync(instance, {
    ...validatorOptions
  })
  if (errors.length > 0) {
    console.log('errors:', errors)
    throw new BadRequestException(
      errors.map((error: ValidationError) => error.constraints)
    )
  } else {
    return instance
  }
}
