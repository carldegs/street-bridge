import {
  useToast,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalProps,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { useFirebase } from '../firebase/useFirebase';
import { useAuth } from '../store/useAuth';
import { Abort } from '../types/Abort';

import InputField from './InputField';

const DeleteAccountModal: React.FC<Abort<ModalProps>> = ({
  isOpen,
  onClose,
}: Abort<ModalProps>) => {
  const firebase = useFirebase();
  const auth = useAuth();
  const toast = useToast();

  const isPasswordSignin = firebase.getUserSignInMethod().includes('password');
  const [password, setPassword] = useState('');

  const onDeleteAccount = async () => {
    if (auth.state.authUser?.email) {
      try {
        await firebase.deleteUser(auth.state.authUser.email, password);
        toast({
          title: 'Account Deleted',
          description: `Account ${auth.state.authUser.email} successfully deleted`,
          status: 'success',
        });
        firebase.logoutUser();
        auth.logout();
      } catch (err) {
        toast({
          title: 'Cannot delete account',
          description: err.message,
          status: 'error',
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="lg" mb={3}>
            Sure ka na ba?
          </Text>
          {isPasswordSignin && (
            <InputField
              onChange={e => {
                setPassword(e.target.value);
              }}
              type="password"
              value={password}
              placeholder="Password"
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            disabled={isPasswordSignin && !password}
            onClick={onDeleteAccount}
          >
            Yes
          </Button>

          <Button colorScheme="green" onClick={onClose} mr={3}>
            No
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteAccountModal;
