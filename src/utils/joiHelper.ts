import { ValidationError } from '@hapi/joi';
import { chain } from 'lodash';

const mapErrorMessages = <T = Record<string, string>>(
  error: ValidationError | undefined
): T =>
  error
    ? ((chain(error.details)
        .map(detail => ({
          key: detail.context?.key || detail.path[0],
          message: detail.message,
        }))
        .keyBy('key')
        .mapValues('message')
        .value() as unknown) as T)
    : ({} as T);

export default mapErrorMessages;
