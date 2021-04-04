import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalProps,
  Modal,
  ModalBody,
  Text,
  Select,
  Button,
  ModalFooter,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { useFirebase } from '../firebase/useFirebase';
import useRoomLobbyData from '../hooks/useRoomLobbyData';
import { Abort } from '../types/Abort';

const ChangeHostModal: React.FC<Abort<ModalProps>> = ({
  isOpen,
  onClose,
}: Abort<ModalProps>) => {
  const [newHost, setNewHost] = useState('');
  const firebase = useFirebase();
  const { id, players, spectators, authUser } = useRoomLobbyData();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Host</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text fontSize="lg">Select new host</Text>
          <Select
            placeholder="Select"
            onChange={e => setNewHost(e.target.value)}
          >
            {[...players, ...spectators]
              .filter(user => user !== authUser.displayName)
              .map(user => (
                <option value={user} key={user}>
                  {user}
                </option>
              ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              firebase.changeHost(id, newHost);
              onClose();
            }}
            isDisabled={!newHost}
          >
            CHANGE HOST
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangeHostModal;
