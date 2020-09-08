import React, { useState, useCallback } from 'react';
import Joi from '@hapi/joi';

import { Row, Col, Form, Alert } from 'react-bootstrap';

import { Link, useHistory } from 'react-router-dom';

import { useFirebase } from '../../firebase/useFirebase';

import useForm, { IState } from '../../hooks/useForm';
import FormInput from '../../components/FormInput/FormInput';

import SBButton from '../../components/SBButton/SBButton';

import styles from './Signup.module.scss';

const initialValues = {
  email: '',
  password: '',
  displayName: '',
};

const schema = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  displayName: Joi.string(),
  password: Joi.string().min(8).required(),
};

const Signup: React.FC = () => {
  const firebase = useFirebase();
  const history = useHistory();
  const [error, setError] = useState('');

  const submitCallback = useCallback(
    async (params: Partial<IState<typeof initialValues>>) => {
      if (!!params.errors || !params.values) {
        return;
      }

      const { email, password, displayName } = params.values;
      await firebase
        .signupUser(email, password, displayName)
        .then(() => {
          history.push('/verify', { email });
        })
        .catch(err => setError(err.message));
    },
    [firebase, history]
  );

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    hasErrors,
  } = useForm(initialValues, schema, submitCallback);

  return (
    <Row className={styles.Signup} data-testid="Signup">
      <Col xs={12} sm={4} className={styles.content}>
        <div className={styles.card}>
          <div className={styles.header}>Signup</div>
          <Form noValidate>
            <FormInput
              controlId="email"
              label="Email"
              values={values}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
              type="email"
            />
            <FormInput
              controlId="displayName"
              label="Username"
              values={values}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
            />
            <FormInput
              controlId="password"
              label="Password"
              values={values}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
              type="password"
            />
          </Form>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="pt-4 float-right">
            <Link to="/" className="mr-3">
              <SBButton outline onClick={() => history.push('/')}>
                LOGIN
              </SBButton>
            </Link>
            <SBButton
              onClick={(e: any) => handleSubmit(e as Event)}
              disabled={hasErrors}
            >
              CREATE ACCOUNT
            </SBButton>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Signup;
