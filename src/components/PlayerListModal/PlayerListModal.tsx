import React from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import cx from 'classnames';

import { Game } from '../../models';

import styles from './PlayerListModal.module.scss';

interface IPlayerListModal extends ModalProps {
  game: Game;
}

const PlayerListModal: React.FC<IPlayerListModal> = ({
  show,
  onHide,
  game,
}: IPlayerListModal) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton />
    <Modal.Body className="d-flex flex-column align-items-center justify-content-center mb-4">
      <span
        style={{ fontSize: '24px', marginTop: '-36px' }}
        className="mb-2 font-weight-bold"
      >
        PLAYERS
      </span>
      {!!game?.players &&
        !!game?.playerInfo &&
        game.players
          .map(player => game.playerInfo[player])
          .map(playerInfo => (
            <div
              className={cx(
                'mt-1',
                'font-weight-bold',
                styles[`text${playerInfo.team === 0 ? 'Red' : 'Blue'}`]
              )}
              style={{ fontSize: '20px' }}
              key={playerInfo.username}
            >
              {playerInfo.username}
            </div>
          ))}
      {!!game.spectators?.length && (
        <>
          <span style={{ fontSize: '24px' }} className="my-2 font-weight-bold">
            SPECTATORS
          </span>
          {game.spectators.map(spec => (
            <div
              className={cx('mt-1', 'font-weight-bold')}
              style={{ fontSize: '20px' }}
              key={spec}
            >
              {spec}
            </div>
          ))}
        </>
      )}
    </Modal.Body>
  </Modal>
);

export default PlayerListModal;
