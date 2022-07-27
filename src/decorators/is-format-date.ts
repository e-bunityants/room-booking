import { registerDecorator, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function IsFormatDate(
  format: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsFormatDate',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `Date format should be ${format}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          return moment(value, format, true).isValid();
        },
      },
    });
  };
}
