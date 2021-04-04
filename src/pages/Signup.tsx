import React from 'react';
import Joi from '@hapi/joi';
import { useHistory } from 'react-router-dom';
import { Box, useToast, Heading, Button, Stack } from '@chakra-ui/react';

import { useFirebase } from '../firebase/useFirebase';

import useJoiForm, { Validation } from '../hooks/useJoiForm';
import Layout from '../components/Layout';
import InputField from '../components/InputField';

interface SignupFormData {
  email: string;
  password: string;
  displayName: string;
  confirmPassword: string;
}

const signupForm = new Validation<SignupFormData>(
  {
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    displayName: Joi.string().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  },
  {
    email: '',
    password: '',
    displayName: '',
    confirmPassword: '',
  }
);

const Signup: React.FC = () => {
  const firebase = useFirebase();
  const history = useHistory();
  const toast = useToast();

  const { handleSubmit, errors, register, formState } = useJoiForm(signupForm);

  const onSubmit = async ({ email, password, displayName }: SignupFormData) => {
    try {
      await firebase.signupUser(email, password, displayName);
      history.push('/verify', { email });
    } catch (err) {
      toast({
        title: 'Signup Errors',
        description: err.message,
        status: 'error',
      });
    }
  };

  return (
    <Layout display="flex" alignItems="center" justifyContent="center">
      <Box
        background="brandLight"
        p={12}
        borderRadius={20}
        minW={['100%', '100%', '400px', '500px']}
        h="fit-content"
      >
        <Heading mb={4} color="brandRed">
          Signup
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6}>
            <InputField
              label="Email"
              name="email"
              type="email"
              register={register}
              isRequired
              errors={errors}
            />

            <InputField
              label="Username"
              name="displayName"
              register={register}
              isRequired
              errors={errors}
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              register={register}
              isRequired
              errors={errors}
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              isRequired
              errors={errors}
            />
          </Stack>

          <Button
            type="submit"
            isFullWidth
            variant="outline"
            colorScheme="blue"
            isLoading={formState.isSubmitting}
            mt={4}
          >
            SIGNUP
          </Button>
        </form>
      </Box>
    </Layout>
  );
};

export default Signup;
