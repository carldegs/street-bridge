/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent } from 'react';

import { Form, FormControlProps } from 'react-bootstrap';

interface IFormInput extends FormControlProps {
  controlId: string;
  label: string;
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (e: ChangeEvent) => void;
  onBlur: (a: any) => void;
}

const FormInput: React.FC<IFormInput> = ({
  controlId,
  label,
  values,
  errors,
  onChange,
  onBlur,
  ...props
}: IFormInput) => {
  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        value={values[controlId]}
        onChange={onChange}
        onBlur={onBlur}
        isInvalid={!!errors[controlId]}
        {...props}
      />
      <Form.Control.Feedback type="invalid">
        {errors[controlId]}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default FormInput;
