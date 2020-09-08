import React, { useCallback, useState } from 'react';
import { Form, Row, Col, Alert, Container } from 'react-bootstrap';
import Joi from '@hapi/joi';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useForm, { IState } from '../../hooks/useForm';
import { useFirebase } from '../../firebase/useFirebase';
import FormInput from '../../components/FormInput/FormInput';

import { ActionType, useDispatch } from '../../store/store';

import SBButton from '../../components/SBButton/SBButton';

import styles from './Landing.module.scss';

const initialValues = {
  email: '',
  password: '',
};

const schema = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(8).required(),
};

const Landing: React.FC = () => {
  const firebase = useFirebase();
  const [error, setError] = useState<any>(undefined);
  const dispatch = useDispatch();

  const submitCallback = useCallback(
    (params: Partial<IState<typeof initialValues>>) => {
      if (!!params.errors || !params.values) {
        return;
      }

      setError(undefined);
      const { email, password } = params.values;
      firebase
        .loginUser(email, password)
        .then(resp => dispatch([ActionType.setAuthUser, resp.user]))
        .catch(err => setError(err));
    },
    [firebase, dispatch]
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
    <Container className={styles.Landing} data-testid="Landing">
      <Row style={{ height: '100vh' }}>
        <Col xs={12} sm={4} className={styles.left}>
          <div className={styles.loginModal}>
            <div className={styles.header}>Login</div>
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
                controlId="password"
                label="Password"
                values={values}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
                type="password"
              />
              {!!error?.message && (
                <Alert variant="danger">
                  {`${error.message} `}
                  {error.code === 'auth/wrong-password' && (
                    <span
                      style={{ textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => {
                        firebase.sendResetPasswordMail(values.email);
                      }}
                    >
                      Reset Password
                    </span>
                  )}
                </Alert>
              )}
              <div className="pt-4 float-right">
                <Link to="/signup">
                  <SBButton outline className="mr-3">
                    SIGNUP
                  </SBButton>
                </Link>
                <SBButton onClick={handleSubmit} disabled={hasErrors}>
                  LOGIN
                </SBButton>
              </div>
            </Form>
          </div>
        </Col>
        <Col xs={12} sm={8} className={styles.right}>
          <div className={styles.street}>Street</div>
          <div className={styles.bridge}>Bridge</div>
        </Col>
      </Row>

      <div
        className={styles.version}
        onClick={() => {
          window.open('https://github.com/carldegs/street-bridge', '_blank');
        }}
        title="Open GitHub repo"
      >
        v0.2.0
        <FontAwesomeIcon icon="code-branch" className="ml-3" />
      </div>
    </Container>
  );
};

export default Landing;
