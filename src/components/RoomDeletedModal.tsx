import React from 'react';

import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  ModalProps,
  ModalBody,
  Button,
} from '@chakra-ui/react';

import { useHistory } from 'react-router';

import { Abort } from '../types/Abort';
import { useAuth } from '../store/useAuth';

const RoomDeletedModal: React.FC<Abort<ModalProps>> = ({
  isOpen,
  onClose,
}: Abort<ModalProps>) => {
  const auth = useAuth();
  const history = useHistory();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Room Not Found</ModalHeader>
        <ModalCloseButton />
        <ModalBody>The room you opened does not exist.</ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              auth.setAuthUserGame(null);
              history.push('/home');
            }}
          >
            Back to Lobby
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoomDeletedModal;
