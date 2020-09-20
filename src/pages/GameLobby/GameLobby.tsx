import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Row, Col, Button, Badge, Modal, Container } from 'react-bootstrap';
import { range } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useFirebase } from '../../firebase/useFirebase';
import { useGame } from '../../firebase/hooks';
import SBButton from '../../components/SBButton/SBButton';
import { Phase } from '../../models';
import { useAuth } from '../../store/useAuth';

import styles from './GameLobby.module.scss';
// TODO: Change how the host is determined
const GameLobby: React.FC = () => {
  const history = useHistory();
  const firebase = useFirebase();
  const { id } = useParams();
  const { game, error: gameError } = useGame(id);
  const { players, host, spectators } = game;

  const auth = useAuth();
  const authUser = auth.state.authUser || { displayName: '' };

  const [showChangeHostModal, setShowChangeHostModal] = useState(false);

  const isSpectator = useMemo(
    () =>
      authUser?.displayName && spectators.some(s => s === authUser.displayName),
    [authUser, spectators]
  );

  const currUserGameInfo = useMemo(() => {
    if (game?.playerInfo && authUser?.displayName) {
      return game.playerInfo[authUser.displayName];
    }

    return undefined;
  }, [game, authUser]);

  const [teamAPlayers, teamBPlayers] = useMemo(() => {
    if (game?.playerInfo) {
      let teamA: string[] = [];
      let teamB: string[] = [];

      Object.values(game.playerInfo).forEach(info => {
        if (info.team === 0) {
          teamA = [...teamA, info.username];
        } else {
          teamB = [...teamB, info.username];
        }
      });

      return [teamA.filter(a => !!a), teamB.filter(b => !!b)];
    }

    return [[], []];
  }, [game]);

  useEffect(() => {
    if (game?.phase === Phase.bid) {
      history.push(`/game/bid/${id}`);
    }
  }, [game, history, id]);

  return (
    <Container className={styles.GameLobby} data-testid="GameLobby">
      <Modal show={gameError === 'no-game'} onHide={undefined}>
        <Modal.Header>Game Deleted</Modal.Header>
        <Modal.Footer>
          <Button
            onClick={() => {
              auth.setAuthUserGame(null);
              history.push('/home');
            }}
          >
            {' '}
            Back to Lobby
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showChangeHostModal}
        onHide={() => setShowChangeHostModal(false)}
      >
        <Modal.Header>Change Host</Modal.Header>
        <Modal.Body>
          <h5 className="mb-4">Select new host</h5>
          <div className="m-3">
            {[...players, ...spectators]
              .filter(user => user !== authUser.displayName)
              .map(user => (
                <SBButton
                  onClick={() => {
                    firebase.changeHost(id, user);
                    setShowChangeHostModal(false);
                  }}
                  outline
                  color="cyan"
                  key={user}
                >
                  {user}
                </SBButton>
              ))}
          </div>
        </Modal.Body>
      </Modal>

      <div className={styles.title}>
        <div className={styles.gameName}>{game?.name || id}</div>
        <div className={styles.phase}>Lobby</div>
      </div>
      <Row>
        <Col sm={2} className={styles.left}>
          {!isSpectator ? (
            <SBButton
              outline
              color="cyan"
              onClick={() => {
                auth.setAuthUserGame(null);
                history.push('/home');
              }}
            >
              BACK TO LOBBY
            </SBButton>
          ) : (
            <SBButton
              outline
              color="cyan"
              onClick={() => {
                firebase.leaveGame(id, authUser?.displayName || '');
                auth.setAuthUserGame(null);
                history.push('/home');
              }}
            >
              LEAVE GAME
            </SBButton>
          )}
          {host === authUser.displayName && (
            <SBButton
              outline
              color="cyan"
              onClick={() => {
                firebase.deleteGame(id);
                auth.setAuthUserGame(null);
              }}
              className="mt-3"
            >
              DELETE GAME
            </SBButton>
          )}
          {host === authUser.displayName && (
            <>
              <SBButton
                color="yellow"
                outline
                onClick={() => setShowChangeHostModal(true)}
                className="mt-3"
              >
                CHANGE HOST
              </SBButton>
              <SBButton
                color="green"
                outline
                disabled={
                  players.length !== 4 ||
                  teamAPlayers.length !== teamBPlayers.length
                }
                onClick={() => firebase.startBidding(id)}
                className="mt-3"
              >
                <FontAwesomeIcon icon="play" className="mr-2" />
                START GAME
              </SBButton>
            </>
          )}
        </Col>
        <Col sm={7} className={styles.right}>
          <div className={styles.teamA}>
            <div className={styles.teamTitle}>Red Team</div>
            <div className={styles.players}>
              {teamAPlayers.map(username => (
                <p key={username}>
                  {username === host && (
                    <Badge className="mx-2" variant="secondary" pill>
                      Host
                    </Badge>
                  )}
                  {username}
                </p>
              ))}
              {2 - teamAPlayers.length >= 0 &&
                range(2 - teamAPlayers.length || 0).map(i => (
                  <p key={`empty-team-${i}`} style={{ opacity: 0.3 }}>
                    Empty
                  </p>
                ))}
            </div>
            {players?.length <= 4 &&
              (!currUserGameInfo || currUserGameInfo.team === 1) && (
                <SBButton
                  outline
                  color="white"
                  onClick={() => {
                    const authUsername = authUser?.displayName || '';
                    const user = !currUserGameInfo
                      ? authUsername
                      : currUserGameInfo.username;
                    firebase.joinGame(id, user, 0);
                  }}
                  className="float-right"
                >
                  {!currUserGameInfo ? 'JOIN' : 'SWITCH'}
                </SBButton>
              )}
          </div>
          <div className={styles.teamB}>
            <div className={styles.teamTitle}>Blue Team</div>
            <div className={styles.players}>
              {teamBPlayers.map(username => (
                <p key={username}>
                  {username}
                  {username === host && (
                    <Badge variant="secondary" className="mx-2">
                      Host
                    </Badge>
                  )}
                </p>
              ))}
              {2 - teamBPlayers.length >= 0 &&
                range(2 - teamBPlayers.length || 0).map(i => (
                  <p key={`empty-team-b-${i}`} style={{ opacity: 0.3 }}>
                    Empty
                  </p>
                ))}
            </div>
            {players?.length <= 4 &&
              (!currUserGameInfo || currUserGameInfo.team === 0) && (
                <SBButton
                  outline
                  color="white"
                  onClick={() => {
                    const authUsername = authUser?.displayName || '';
                    const user = !currUserGameInfo
                      ? authUsername
                      : currUserGameInfo.username;
                    firebase.joinGame(id, user, 1);
                  }}
                >
                  {!currUserGameInfo ? 'JOIN' : 'SWITCH'}
                </SBButton>
              )}
          </div>
        </Col>
        <Col sm={3}>
          <div className={styles.right}>
            <div className={styles.spectators}>
              <div className={styles.teamTitle}>Spectators</div>
              <div className={styles.players}>
                {game?.spectators.map((username: string) => (
                  <p key={username}>
                    {username}
                    {username === host && (
                      <Badge className="mx-2" variant="secondary" pill>
                        Host
                      </Badge>
                    )}
                  </p>
                ))}
              </div>
              {!isSpectator && (
                <SBButton
                  outline
                  color="white"
                  onClick={() => {
                    if (authUser.displayName) {
                      firebase.spectateGame(id, authUser.displayName);
                    }
                  }}
                  className="float-right"
                  style={{ alignSelf: 'center' }}
                >
                  SPECTATE
                </SBButton>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default GameLobby;
