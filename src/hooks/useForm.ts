import {
  ChangeEvent,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import Joi from '@hapi/joi';

import mapErrorMessages from '../utils/joiHelper';

enum ActionType {
  setValues,
  setErrors,
  resetErrors,
}

type StateErrors<V = Record<string, any>> = Record<keyof V, string>;

export interface IState<V> {
  values: V;
  errors: StateErrors<V>;
}

export interface IAction {
  type: ActionType;
  payload: any;
}

export interface IUseForm<V = Record<string, any>> extends IState<V> {
  handleChange: (e: ChangeEvent) => void;
  handleBlur: (a: any) => void;
  handleSubmit: (e: Event) => void;
  getErrors: (key?: string) => any;
  hasErrors: boolean;
}

const initializeErrors = <V>(keys: any[]): StateErrors<V> => {
  let errors = {};

  keys.forEach(key => {
    errors = {
      ...errors,
      [key]: '',
    };
  });

  return errors as StateErrors<V>;
};

const createFormReducer = <V>() => (
  state: IState<V>,
  action: IAction
): IState<V> => {
  switch (action.type) {
    case ActionType.setValues: {
      const newValues: Record<keyof V, any> = action.payload;
      return {
        ...state,
        values: {
          ...state.values,
          ...newValues,
        },
      };
    }
    case ActionType.setErrors: {
      const newErrors: StateErrors<V> = action.payload;
      return {
        ...state,
        errors: {
          ...state.errors,
          ...newErrors,
        },
      };
    }
    case ActionType.resetErrors: {
      const keysToReset: (keyof V)[] = action.payload || [];
      if (!keysToReset.length) {
        return {
          ...state,
          errors: initializeErrors(Object.keys(state.values)),
        };
      }

      let newErrors = { ...state.errors };
      keysToReset.forEach(key => {
        newErrors = {
          ...newErrors,
          [key]: '',
        };
      });

      return {
        ...state,
        errors: newErrors,
      };
    }
    default:
      return state;
  }
};

const createActions = <V>(dispatch?: React.Dispatch<IAction>) => ({
  setValues: (newValues: Record<keyof V, any>) =>
    dispatch
      ? dispatch({
          type: ActionType.setValues,
          payload: newValues,
        })
      : null,
  setErrors: (newErrors: Partial<StateErrors<V>>) =>
    dispatch
      ? dispatch({
          type: ActionType.setErrors,
          payload: newErrors,
        })
      : null,
  resetErrors: (keysToReset: (keyof V)[] = []) =>
    dispatch
      ? dispatch({
          type: ActionType.resetErrors,
          payload: keysToReset,
        })
      : null,
});

const useForm = <V = Record<string, any>>(
  initialValues: V,
  schema: Record<string, Joi.Schema>,
  submitCallback: (params: Partial<IState<V>>) => void
): IUseForm<V> => {
  const reducer = useMemo(() => createFormReducer<V>(), []);
  const [{ values, errors }, dispatch] = useReducer(reducer, {
    values: initialValues,
    errors: initializeErrors<V>(Object.keys(initialValues)),
  });

  const actions = useMemo(() => createActions<V>(dispatch), [dispatch]);
  const getErrors = useCallback(
    (key?: string) => {
      const { error } = Joi.object()
        .keys(key && schema[key] ? { [key]: schema[key] } : schema)
        .validate(values, { abortEarly: false, stripUnknown: true });
      return mapErrorMessages(error);
    },
    [schema, values]
  );

  const handleChange = useCallback(
    (event: ChangeEvent) => {
      const { value, checked, type } = event.target as HTMLInputElement;
      const id = event.target.id as keyof V;

      if (errors[id]) {
        actions.resetErrors([id]);
      }

      actions.setValues({
        [id]: type === 'checkbox' ? checked : value,
      } as Record<keyof V, any>);
    },
    [errors, actions]
  );

  const handleBlur = useCallback(
    e => {
      const newErrors = getErrors(e.target?.id || undefined);
      if (Object.keys(newErrors).length) {
        actions.setErrors(newErrors);
      }
    },
    [actions, getErrors]
  );

  const handleSubmit = useCallback(
    (event: Event) => {
      event.preventDefault();
      const newErrors = getErrors();

      if (Object.keys(newErrors).length) {
        actions.setErrors(newErrors);
        submitCallback({ errors: newErrors });
      }

      submitCallback({ values });
    },
    [actions, submitCallback, getErrors, values]
  );

  useEffect(() => {
    actions.setValues(initialValues);
  }, [initialValues, actions]);

  return {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    getErrors,
    hasErrors: !!Object.values(errors).filter(i => !!i).length,
  };
};

export default useForm;
