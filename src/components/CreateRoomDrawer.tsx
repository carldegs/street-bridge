import React from 'react';
import {
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { useHistory } from 'react-router';
import Joi from '@hapi/joi';

import { Abort } from '../types/Abort';
import useJoiForm, { Validation } from '../hooks/useJoiForm';
import { useFirebase } from '../firebase/useFirebase';
import { useAuth } from '../store/useAuth';
import { Game } from '../models';

import InputField from './InputField';

interface CreateRoomFormData {
  name: string;
}

const createRoomForm = new Validation<CreateRoomFormData>(
  { name: Joi.string().required() },
  { name: '' }
);

const CreateRoomDrawer: React.FC<Abort<DrawerProps>> = ({
  isOpen,
  onClose,
}: Abort<DrawerProps>) => {
  const firebase = useFirebase();
  const history = useHistory();
  const toast = useToast();
  const auth = useAuth();

  const { handleSubmit, errors, register, formState } = useJoiForm(
    createRoomForm
  );

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      const id = await firebase.createGame(
        auth.state.authUser?.displayName || '',
        data.name
      );
      const game = await firebase.games.doc(id).get();

      auth.setAuthUserGame(game.data() as Game);
      history.push(`/game/lobby/${id}`);
    } catch (err) {
      toast({
        title: 'Cannot create room',
        description: err.message,
        status: 'error',
      });
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="top">
      <DrawerOverlay>
        <DrawerContent>
          <Container maxW="container.md">
            <DrawerHeader>Create Room</DrawerHeader>
            <DrawerBody>
              <InputField
                name="name"
                label="Room Name"
                register={register}
                isRequired
                errors={errors}
              />
            </DrawerBody>
            <DrawerFooter>
              <HStack spacing={4}>
                <Button colorScheme="red" onClick={onClose}>
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  colorScheme="green"
                  onClick={handleSubmit(onSubmit)}
                  isLoading={formState.isSubmitting}
                  isDisabled={!formState.isDirty || !formState.isValid}
                >
                  CREATE ROOM
                </Button>
              </HStack>
            </DrawerFooter>
          </Container>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default CreateRoomDrawer;
