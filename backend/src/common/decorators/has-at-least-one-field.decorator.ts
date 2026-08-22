import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export function HasAtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (target: Function) {
    registerDecorator({
      name: 'hasAtLeastOneField',
      target,
      propertyName: '__class__',
      constraints: [fields],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [allowedFields] = args.constraints as [string[]];
          const object = args.object as Record<string, unknown>;

          return allowedFields.some(
            (field) => object[field] !== undefined,
          );
        },
      },
    });
  };
}