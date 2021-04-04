import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  Button,
} from '@chakra-ui/react';
import React from 'react';
import { useHistory, useParams } from 'react-router';

import { useGame } from '../firebase/hooks';
import { useFirebase } from '../firebase/useFirebase';
import { DefaultParams } from '../models';
import { useAuth } from '../store/useAuth';

type AlertDialogComponentProps = Omit<
  AlertDialogProps,
  'children' | 'leastDestructiveRef'
>;
export const BackToLobbyAlertDialog: React.FC<AlertDialogComponentProps> = ({
  onClose,
  isOpen,
}: AlertDialogComponentProps) => {
  const cancelRef = React.useRef();
  const auth = useAuth();
  const history = useHistory();

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef as any}
      onClose={onClose}
      isOpen={isOpen}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Return To Lobby
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to leave the game and return to the lobby?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef as any} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                auth.setAuthUserGame(null);
                onClose();
                history.push('/home');
              }}
              ml={3}
            >
              Leave Game
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export const StopGameAlertDialog: React.FC<AlertDialogComponentProps> = ({
  onClose,
  isOpen,
}: AlertDialogComponentProps) => {
  const cancelRef = React.useRef();
  const { id } = useParams<DefaultParams>();
  const { game } = useGame(id);
  const firebase = useFirebase();

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef as any}
      onClose={onClose}
      isOpen={isOpen}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Stop Game
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to stop the game?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef as any} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                firebase.resetGame(id, game.players);
                onClose();
              }}
              ml={3}
            >
              Stop Game
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
