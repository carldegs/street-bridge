import React, { useMemo, useState } from 'react';
import cx from 'classnames';
import { useParams, useHistory } from 'react-router-dom';
import { Col, Row, Modal } from 'react-bootstrap';
import { sortBy } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useGame } from '../../firebase/hooks';
import { useFirebase } from '../../firebase/useFirebase';
import { useAuth } from '../../store/useAuth';
import Cards from '../../components/Cards/Cards';
import { Card, BidSuit, Phase } from '../../models';
import CardComponent from '../../components/CardComponent/CardComponent';
import SBButton from '../../components/SBButton/SBButton';
import { getSuitString } from '../../utils/cards';
import RoundsSummary from '../../components/RoundsSummary/RoundsSummary';

import styles from './GamePlay.module.scss';
import useGameDetails from './useGameDetails';

const GamePlay: React.FC = () => {
  const history = useHistory();
  const { id } = useParams();
  const { game, error: gameError } = useGame(id);
  const playersTable = useGameDetails(id);
  const firebase = useFirebase();
  const auth = useAuth();
  const authUser = auth.state.authUser || { displayName: '' };
  const [showStopModal, setShowStopModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);

  const cards: Card[] = useMemo(() => {
    if (authUser.displayName) {
      const unsortedCards = game?.playerInfo[authUser.displayName]?.cards || [];
      return sortBy(unsortedCards, ['suit', 'value']);
    }
    return [];
  }, [game, authUser]);

  return (
    <div className={styles.GamePlay}>
      <Modal show={gameError === 'no-game' && game.phase !== Phase.post}>
        <Modal.Header>Game Stopped</Modal.Header>
        <Modal.Footer>
          <SBButton
            onClick={() => {
              auth.setAuthUserGame(null);
              history.push('/home');
            }}
          >
            Back to Lobby
          </SBButton>
        </Modal.Footer>
      </Modal>
      <Modal show={showStopModal} onHide={() => setShowStopModal(false)}>
        <Modal.Header closeButton>Stop Game</Modal.Header>
        <Modal.Body>Are you sure you want to stop the game?</Modal.Body>
        <Modal.Footer>
          <SBButton onClick={() => setShowStopModal(false)}>CANCEL</SBButton>
          <SBButton
            color="red"
            onClick={() => {
              firebase.deleteGame(id);
              auth.setAuthUserGame(null);
            }}
          >
            STOP GAME
          </SBButton>
        </Modal.Footer>
      </Modal>
      <Modal size="xl" show={game.phase === Phase.post}>
        <Modal.Body className="d-flex flex-column justify-content-center">
          <Row>
            <Col>
              <div
                className={cx(
                  styles.postHeader,
                  styles[`text${playersTable.gameWinner}`]
                )}
              >
                {`${playersTable.gameWinner} Team Wins!`}
              </div>
            </Col>
          </Row>
          <Row>
            <Col className={styles.redScore}>
              {game?.score?.length ? game.score[0] : 0}
              <div className={styles.subtitle}>
                {playersTable.scoresToWin
                  ? `${playersTable.scoresToWin[0]} to win`
                  : 'N/A'}
              </div>
            </Col>
            <Col className={styles.blueScore}>
              {game?.score?.length ? game.score[1] : 0}
              <div className={styles.subtitle}>
                {playersTable.scoresToWin
                  ? `${playersTable.scoresToWin[1]} to win`
                  : 'N/A'}
              </div>
            </Col>
          </Row>
          <Row>
            <Col className="mx-5 my-4">
              <RoundsSummary rounds={game?.rounds} players={game?.playerInfo} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {playersTable.isHost && (
            <SBButton
              outline
              color="cyan"
              className="mr-2"
              onClick={() => {
                firebase.resetGame(id, game.players);
                history.push(`/game/lobby/${id}`);
              }}
            >
              Play Again
            </SBButton>
          )}
          <SBButton
            outline
            color="red"
            disabled={!playersTable.isHost && gameError !== 'no-game'}
            onClick={() => {
              if (gameError !== 'no-game') {
                firebase.deleteGame(id);
              }

              auth.setAuthUserGame(null);
              history.push('/home');
            }}
          >
            {playersTable.isHost ||
            (!playersTable.isHost && gameError === 'no-game')
              ? 'Back to Lobby'
              : 'Waiting for host...'}
          </SBButton>
        </Modal.Footer>
      </Modal>
      <Modal
        size="xl"
        show={showRecapModal}
        onHide={() => setShowRecapModal(false)}
      >
        <Modal.Header closeButton>
          <div
            className={styles.postHeader}
            style={{ marginLeft: '32px', fontSize: '42px' }}
          >
            Recap
          </div>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column justify-content-center">
          <Row>
            <Col className={styles.redScore}>
              {game?.score?.length ? game.score[0] : 0}
              <div className={styles.subtitle}>
                {playersTable.scoresToWin
                  ? `${playersTable.scoresToWin[0]} to win`
                  : 'N/A'}
              </div>
            </Col>
            <Col className={styles.blueScore}>
              {game?.score?.length ? game.score[1] : 0}
              <div className={styles.subtitle}>
                {playersTable.scoresToWin
                  ? `${playersTable.scoresToWin[1]} to win`
                  : 'N/A'}
              </div>
            </Col>
          </Row>
          <Row>
            <Col className="mx-5 my-4">
              <RoundsSummary rounds={game?.rounds} players={game?.playerInfo} />
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      <Modal
        size="sm"
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
      >
        <Modal.Header closeButton />
        <Modal.Body className="d-flex flex-column align-items-center justify-content-center mb-4">
          <span
            style={{ fontWeight: 'bold', fontSize: '24px', marginTop: '-36px' }}
          >
            OPTIONS
          </span>
          <SBButton
            outline
            color="cyan"
            className="mt-3"
            onClick={() => {
              setShowOptionsModal(false);
              setShowRecapModal(true);
            }}
          >
            RECAP
          </SBButton>
          {playersTable.isHost && (
            <SBButton
              outline
              color="red"
              className="mt-3"
              onClick={() => {
                setShowOptionsModal(false);
                setShowStopModal(true);
              }}
            >
              STOP GAME
            </SBButton>
          )}
        </Modal.Body>
      </Modal>
      <Row className="d-flex d-md-none">
        <Col className={styles.smallInfo}>
          <div className={styles.subtitle}>Current Bid:</div>
          <div
            className={cx(
              styles.bidInfo,
              styles[`text${playersTable.bidColor}`]
            )}
          >
            {playersTable?.currBid?.value ? (
              <>
                {playersTable?.currBid.suit !== BidSuit.pass
                  ? playersTable?.currBid.value
                  : ''}
                <span className="font-weight-bold">
                  {getSuitString(playersTable?.currBid.suit)}
                </span>
              </>
            ) : (
              'N/A'
            )}
          </div>
        </Col>
        <Col className={styles.smallInfo}>
          <div className={styles.redScore}>
            {game?.score?.length ? game.score[0] : 0}
            <div className={styles.subtitle}>
              {playersTable.scoresToWin
                ? `/${playersTable.scoresToWin[0]}`
                : 'N/A'}
            </div>
          </div>
          <div className={styles.blueScore}>
            {game?.score?.length ? game.score[1] : 0}
            <div className={styles.subtitle}>
              {playersTable.scoresToWin
                ? `/${playersTable.scoresToWin[1]}`
                : 'N/A'}
            </div>
          </div>
        </Col>
      </Row>
      <Row style={{ width: '100%' }}>
        <Col
          sm={2}
          className="d-none d-md-flex flex-column align-items-center justify-content-center"
        >
          <div
            className={cx(
              styles.bidInfo,
              styles[`text${playersTable.bidColor}`]
            )}
          >
            {playersTable?.currBid?.value ? (
              <>
                {playersTable?.currBid.suit !== BidSuit.pass
                  ? playersTable?.currBid.value
                  : ''}
                <span className="font-weight-bold">
                  {getSuitString(playersTable?.currBid.suit)}
                </span>
              </>
            ) : (
              'N/A'
            )}
          </div>
          <div className={styles.subtitle}>Current Bid</div>
        </Col>
        <Col>
          <div className={styles.row1}>
            <div
              className={cx(styles.topPlayer, {
                [styles[`text${playersTable.teamColor}`]]:
                  playersTable.top.isCurrPlayer,
              })}
            >
              {playersTable.top.username}
            </div>
          </div>
          <div className={styles.row2}>
            <div
              className={cx(styles.leftPlayer, {
                [styles[`text${playersTable.enemyColor}`]]:
                  playersTable.left.isCurrPlayer,
              })}
            >
              {playersTable.left.username}
            </div>
            <div
              className={cx(
                styles.table,
                styles[`border${playersTable.currPlayerColor}`],
                {
                  [styles[`topBox${playersTable.teamColor}`]]:
                    playersTable.top.isCurrPlayer,
                  [styles[`leftBox${playersTable.enemyColor}`]]:
                    playersTable.left.isCurrPlayer,
                  [styles[`rightBox${playersTable.enemyColor}`]]:
                    playersTable.right.isCurrPlayer,
                  [styles[`bottomBox${playersTable.teamColor}`]]:
                    playersTable.bottom.isCurrPlayer,
                  [styles[
                    `win${playersTable.roundWinner}`
                  ]]: !!playersTable.roundWinner,
                }
              )}
            >
              <Row className="w-100" style={{ height: '140px' }}>
                <Col className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.top.card}
                    className={styles.tableCardTop}
                  />
                </Col>
              </Row>
              <Row className="w-100" style={{ height: '140px' }}>
                <Col xs={6} className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.left.card}
                    className={styles.tableCardLeft}
                  />
                </Col>
                <Col xs={6} className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.right.card}
                    className={styles.tableCardRight}
                  />
                </Col>
              </Row>
              <Row className="w-100" style={{ height: '140px' }}>
                <Col className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.bottom.card}
                    className={styles.tableCardBottom}
                  />
                </Col>
              </Row>
            </div>
            <div
              className={cx(styles.rightPlayer, {
                [styles[`text${playersTable.enemyColor}`]]:
                  playersTable.right.isCurrPlayer,
              })}
            >
              {playersTable.right.username}
            </div>
          </div>
          <div className={styles.row3}>
            <div
              className={cx(styles.bottomPlayer, {
                [styles[`text${playersTable.teamColor}`]]:
                  playersTable.bottom.isCurrPlayer,
              })}
            >
              {playersTable.bottom.username}
            </div>
          </div>
        </Col>
        <Col
          sm={2}
          className="d-none d-md-flex flex-column align-items-center justify-content-center"
        >
          <div className={styles.redScore}>
            {game?.score?.length ? game.score[0] : 0}
            <div className={styles.subtitle}>
              {playersTable.scoresToWin
                ? `${playersTable.scoresToWin[0]} to win`
                : 'N/A'}
            </div>
          </div>
          <div className={styles.blueScore}>
            {game?.score?.length ? game.score[1] : 0}
            <div className={styles.subtitle}>
              {playersTable.scoresToWin
                ? `${playersTable.scoresToWin[1]} to win`
                : 'N/A'}
            </div>
          </div>
        </Col>
      </Row>
      <Row className="w-100">
        <Col>
          {!playersTable.isSpectator && (
            <Cards
              cards={cards}
              disabled={
                playersTable.currPlayer !== authUser.displayName ||
                !!playersTable.currPlayerCard
              }
              onClick={card => {
                if (authUser.displayName) {
                  firebase.playCard(id, authUser.displayName, card);
                }
              }}
              isFirstPlayer={playersTable.isFirstPlayer}
              roundSuit={playersTable.roundSuit}
            />
          )}
        </Col>
      </Row>
      <div className={styles.settings}>
        {playersTable.isSpectator && (
          <div className={cx(styles.spectatorText, 'mr-3')}>Spectating</div>
        )}
        <SBButton
          outline
          color="cyan"
          onClick={() => {
            setShowOptionsModal(true);
          }}
        >
          <FontAwesomeIcon icon="ellipsis-h" />
        </SBButton>
      </div>
    </div>
  );
};

export default GamePlay;
