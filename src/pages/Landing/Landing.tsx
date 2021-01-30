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
              <div className="mt-4 mb-3" style={{ height: '27px' }}>
                <Row>
                  <Col />
                  <Col>
                    <Link to="/signup">
                      <SBButton outline className="mr-3">
                        SIGNUP
                      </SBButton>
                    </Link>
                    <SBButton onClick={handleSubmit} disabled={hasErrors}>
                      LOGIN
                    </SBButton>
                  </Col>
                </Row>
              </div>
              <div
                style={{
                  borderTop: '1px solid #000000',
                  marginLeft: '-16px',
                  width: 'calc(100% + 32px)',
                  opacity: '0.3',
                }}
                className="my-4"
              />
              <div>
                <SBButton
                  outline
                  className="d-flex w-100"
                  onClick={() => firebase.loginUserWithGoogle()}
                >
                  <img
                    src="https://cdn.worldvectorlogo.com/logos/google-icon.svg"
                    height="20"
                    alt="google-logo"
                    className="mr-3"
                  />
                  SIGN IN WITH GOOGLE
                </SBButton>
              </div>

              {!!error?.message && (
                <Alert variant="danger" className="mt-4 mb-0">
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
        v0.2.8
        <FontAwesomeIcon icon="code-branch" className="ml-3" />
      </div>
    </Container>
  );
};

export default Landing;
