import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

export function IsGrateOrEqualThenDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsGrateOrEqualThenDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message: `${property} should be less or equal than ${propertyName}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          return moment(value).isSameOrAfter(relatedValue);
        },
      },
    });
  };
}
