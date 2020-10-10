import React from 'react';
import { Modal } from 'react-bootstrap';

import SBButton from '../SBButton/SBButton';

interface IStopGameModal {
  show?: boolean;
  onHide: () => void;
  onStopClick: () => void;
}

const StopGameModal: React.FC<IStopGameModal> = ({
  show,
  onHide,
  onStopClick,
}: IStopGameModal) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>Stop Game</Modal.Header>
    <Modal.Body>Are you sure you want to stop the game?</Modal.Body>
    <Modal.Footer>
      <SBButton onClick={onHide}>CANCEL</SBButton>
      <SBButton color="red" onClick={onStopClick}>
        STOP GAME
      </SBButton>
    </Modal.Footer>
  </Modal>
);

export default StopGameModal;
