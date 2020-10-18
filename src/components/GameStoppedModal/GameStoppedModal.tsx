import React from 'react';
import { Modal } from 'react-bootstrap';

import SBButton from '../SBButton/SBButton';

interface IGameStoppedModal {
  show?: boolean;
  onClick?: () => void;
}

const GameStoppedModal: React.FC<IGameStoppedModal> = ({
  show,
  onClick,
}: IGameStoppedModal) => (
  <Modal show={show}>
    <Modal.Header>Game Stopped</Modal.Header>
    <Modal.Footer>
      <SBButton onClick={onClick}>Back to Lobby</SBButton>
    </Modal.Footer>
  </Modal>
);

export default GameStoppedModal;
