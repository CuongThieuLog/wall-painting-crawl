import {
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'

@ValidatorConstraint()
class StartsWithConstraint implements ValidatorConstraintInterface {
  validate(text: string, { constraints }: ValidationArguments) {
    return text.startsWith(constraints[0])
  }
  defaultMessage(validationArguments: ValidationArguments) {
    return `${validationArguments.property} must start with ${validationArguments.constraints[0]}`
  }
}

export const StartsWith = (
  text: string,
  validationOptions?: ValidationOptions
) => Validate(StartsWithConstraint, [text], validationOptions)
