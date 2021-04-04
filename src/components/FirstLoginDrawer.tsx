import React, { useState } from 'react';
import sample from 'lodash/sample';
import {
  Button,
  Container,
  Flex,
  Heading,
  Spacer,
  Text,
  useToast,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import Joi from '@hapi/joi';
import { useHistory } from 'react-router';

import { useFirebase } from '../firebase/useFirebase';
import { useAuth } from '../store/useAuth';
import useJoiForm, { Validation } from '../hooks/useJoiForm';

import InputField from './InputField';

const GREETINGS = ['Hi', 'Hello', 'Uyyyy', 'Kamusta', 'Welcome'];

interface SetupAccountForm {
  username: string;
}

const setupAccountForm = new Validation<SetupAccountForm>(
  {
    username: Joi.string().alphanum().min(4).required(),
  },
  { username: '' }
);

const FirstLoginDrawer: React.FC = () => {
  const firebase = useFirebase();
  const auth = useAuth();
  const toast = useToast();
  const history = useHistory();

  const [greeting] = useState(sample(GREETINGS));

  const { handleSubmit, errors, register, formState } = useJoiForm(
    setupAccountForm
  );

  const onSubmit = async (data: SetupAccountForm) => {
    try {
      await firebase.updateUser({
        displayName: data.username,
      });
      history.go(0);
    } catch (err) {
      toast({
        title: 'Setup Error',
        description: err?.message,
        status: 'error',
      });
    }
  };

  return (
    <Drawer
      isOpen={firebase.isGoogleUserFirstLogin()}
      onClose={() => undefined}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      placement="top"
      size="full"
    >
      <DrawerOverlay>
        <DrawerContent>
          <Container maxW="container.lg" h="100vh">
            <Flex flexDir="column" h="100vh">
              <Spacer />
              <DrawerHeader
                as={Heading}
              >{`${greeting} ${auth.state.authUser?.displayName}!`}</DrawerHeader>
              <DrawerBody>
                <Text fontSize="2xl" mb={6}>
                  Let&apos;s setup your account
                </Text>
                <InputField
                  name="username"
                  label="Username"
                  helperText="Should be at least 4 characters long and must only consist of alphanumeric characters."
                  register={register}
                  isRequired
                  errors={errors}
                />
              </DrawerBody>
              <DrawerFooter>
                <Button
                  p={12}
                  onClick={handleSubmit(onSubmit)}
                  isLoading={formState.isSubmitting}
                  isDisabled={!formState.isDirty || !formState.isValid}
                  colorScheme="purple"
                >
                  SEND
                </Button>
              </DrawerFooter>
              <Spacer />
            </Flex>
          </Container>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default FirstLoginDrawer;
