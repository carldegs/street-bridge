import { joiResolver } from '@hookform/resolvers/joi';
import { useForm, UseFormMethods } from 'react-hook-form';
import Joi, { AnySchema, ObjectSchema } from '@hapi/joi';

export class Validation<T> {
  // eslint-disable-next-line no-useless-constructor
  constructor(public keys: Record<keyof T, AnySchema>, public defaults: T) {}

  get schema(): ObjectSchema<any> {
    return Joi.object(this.keys).unknown(true);
  }
}

const useJoiForm = <T = Record<string, any>, P = undefined>(
  formValidation: Validation<T>,
  defaultValues?: P
): UseFormMethods<T> => {
  const results = useForm<T>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || (formValidation.defaults as any),
    criteriaMode: 'all',
    resolver: joiResolver(formValidation.schema, { abortEarly: false }),
  });

  return results;
};

export default useJoiForm;
