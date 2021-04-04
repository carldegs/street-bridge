import React from 'react';
import { Container } from 'react-bootstrap';
import Joi from '@hapi/joi';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Divider,
  useToast,
  Image,
  Text,
  Heading,
  Center,
  Flex,
} from '@chakra-ui/react';

import { useFirebase } from '../firebase/useFirebase';
import { ActionType, useDispatch } from '../store/store';
import Layout from '../components/Layout';

import InputField from '../components/InputField';
import useJoiForm, { Validation } from '../hooks/useJoiForm';

interface LoginFormData {
  email: string;
  password: string;
}

const loginForm = new Validation<LoginFormData>(
  {
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(8).required(),
  },
  {
    email: '',
    password: '',
  }
);

const Landing: React.FC = () => {
  const firebase = useFirebase();
  const dispatch = useDispatch();
  const toast = useToast();

  const { handleSubmit, errors, register, formState } = useJoiForm(loginForm);

  const onSubmit = async (data: LoginFormData) => {
    const { email, password } = data;

    try {
      const resp = await firebase.loginUser(email, password);
      dispatch([ActionType.setAuthUser, resp.user]);
    } catch (err) {
      toast({
        title: 'Login Error',
        description: err.message,
        status: 'error',
      });
    }
  };

  return (
    <Layout
      display="flex"
      flexDir={['column-reverse', 'column-reverse', 'row']}
      alignItems="center"
      as={Container}
    >
      <Box
        background="brandLight"
        p={12}
        borderRadius={20}
        minW={[0, 0, '300px', '400px']}
        h="fit-content"
      >
        <Heading mb={4} color="brandRed">
          Login
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="Email"
            name="email"
            type="email"
            register={register}
            isRequired
            errors={errors}
            data-testid="login-email"
            mb={6}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            isRequired
            errors={errors}
            data-testid="login-pw"
          />

          <Button
            type="submit"
            isFullWidth
            variant="outline"
            colorScheme="blue"
            isLoading={formState.isSubmitting}
            mt={4}
          >
            LOGIN
          </Button>
        </form>
        <Divider />
        <Button
          type="submit"
          isFullWidth
          variant="outline"
          colorScheme="red"
          mt={4}
          onClick={() => firebase.loginUserWithGoogle()}
        >
          <Image
            src="https://cdn.worldvectorlogo.com/logos/google-icon.svg"
            width="20px"
            height="20px"
            mr={3}
          />
          SIGN IN WITH GOOGLE
        </Button>
        <Center mt={4}>
          <Text>No account?</Text>
          <Link to="/signup" style={{ marginLeft: '4px' }}>
            Signup
          </Link>
        </Center>
      </Box>
      <Flex flexGrow={1} alignItems="center" justifyContent="center">
        <Box>
          <Heading
            fontSize={['42px', '64px', '72px', '120px']}
            fontFamily="IBM Plex Sans"
            fontStyle="italic"
            fontWeight="bold"
            color="brandLight"
          >
            Street
          </Heading>
          <Heading
            fontSize={['52px', '72px', '98px', '144px']}
            fontFamily="IBM Plex Serif"
            fontStyle="italic"
            fontWeight="bold"
            color="brandRed"
            mt={['-38px', '-58px', '-64px', '-100px']}
            ml={['24px', '48px', '60px', '72px']}
          >
            Bridge
          </Heading>
        </Box>
      </Flex>
      <Box
        onClick={() => {
          window.open('https://github.com/carldegs/street-bridge', '_blank');
        }}
        title="Open GitHub repo"
        position="absolute"
        bottom={4}
        right={4}
        color="white"
        cursor="pointer"
      >
        v0.3.0
        <FontAwesomeIcon icon="code-branch" className="ml-3" />
      </Box>
    </Layout>
  );
};

export default Landing;
