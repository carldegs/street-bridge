import React, { useMemo } from 'react';

import { useParams, Link } from 'react-router-dom';

import { Row, Col, Button, Badge, Modal } from 'react-bootstrap';

import { range } from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useFirebase } from '../../firebase/useFirebase';

import { useStore } from '../../store/store';
import { useGame } from '../../firebase/hooks';

import SBButton from '../../components/SBButton/SBButton';

import styles from './GameLobby.module.scss';

const GameLobby: React.FC = () => {
  const firebase = useFirebase();
  const { id } = useParams();
  const { game, error: gameError } = useGame(id);
  const { players } = game;

  const { authUser } = useStore();
  const currUserGameInfo = useMemo(() => {
    if (game?.playerInfo && authUser.displayName) {
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

      return [teamA, teamB];
    }

    return [[], []];
  }, [game]);

  return (
    <div className={styles.GameLobby} data-testid="GameLobby">
      <Modal show={gameError === 'no-game'}>
        <Modal.Header>Game Deleted</Modal.Header>
        <Modal.Footer>
          <Link to="/home">
            <Button>Back to Lobby</Button>
          </Link>
        </Modal.Footer>
      </Modal>

      {/* <div className={styles.title}>
        <div className={styles.gameName}>{name || id}</div>
        <div className={styles.phase}>Lobby</div>
      </div> */}
      <Row>
        <Col sm={2} className={styles.left}>
          {!currUserGameInfo ? (
            <Link to="/home">
              <SBButton outline color="cyan">
                BACK TO LOBBY
              </SBButton>
            </Link>
          ) : (
            <SBButton
              outline
              color="cyan"
              onClick={() => {
                firebase.leaveGame(id, authUser?.displayName || '');
              }}
            >
              LEAVE GAME
            </SBButton>
          )}
          {players[0] === authUser.displayName && (
            <SBButton
              outline
              color="cyan"
              onClick={() => {
                firebase.deleteGame(id);
              }}
              className="mt-3"
            >
              DELETE GAME
            </SBButton>
          )}
          {players[0] === authUser.displayName && (
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
          )}
        </Col>
        <Col sm={8} className={styles.right}>
          <div className={styles.teamA}>
            <div className={styles.teamTitle}>Red Team</div>
            <div className={styles.players}>
              {teamAPlayers.map(username => (
                <p key={username}>
                  {username === players[0] && (
                    <Badge className="mr-2" variant="secondary" pill>
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
                  {username === players[0] && (
                    <Badge variant="secondary">Host</Badge>
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
      </Row>
      {/* <Row>
        <Col>
          <h1>{`Game ${name || id}`}</h1>
        </Col>
        <Col>
          <Button
            onClick={() => {
              firebase.logoutUser();
            }}
          >
            Logout
          </Button>
        </Col>
        <Col>
          <Link to="/home">
            <Button>Back to Lobby</Button>
          </Link>
        </Col>
        <Col>
          <Button
            onClick={() => {
              firebase.leaveGame(id, authUser?.displayName || '');
            }}
          >
            Leave Game
          </Button>
        </Col>
        {players[0] === authUser.displayName && (
          <Col>
            <Button
              onClick={() => {
                firebase.deleteGame(id);
              }}
            >
              Delete Game
            </Button>
          </Col>
        )}
      </Row>
      <Row>
        <Col>
          <h2>Team A</h2>
          {teamAPlayers.map(username => (
            <p key={username}>
              {username}
              {username === players[0] && (
                <Badge variant="secondary">Host</Badge>
              )}
            </p>
          ))}
          {players?.length <= 4 &&
            (!currUserGameInfo || currUserGameInfo.team === 1) && (
              <Button
                onClick={() => {
                  const authUsername = authUser?.displayName || '';
                  const user = !currUserGameInfo
                    ? authUsername
                    : currUserGameInfo.username;
                  firebase.joinGame(id, user, 0);
                }}
              >
                {!currUserGameInfo ? 'Join' : 'Switch'}
              </Button>
            )}
        </Col>
        <Col>
          <h2>Team B</h2>

          {teamBPlayers.map(username => (
            <p key={username}>
              {username}
              {username === players[0] && (
                <Badge variant="secondary">Host</Badge>
              )}
            </p>
          ))}

          {players?.length <= 4 &&
            (!currUserGameInfo || currUserGameInfo.team === 0) && (
              <Button
                onClick={() => {
                  const authUsername = authUser?.displayName || '';
                  const user = !currUserGameInfo
                    ? authUsername
                    : currUserGameInfo.username;
                  firebase.joinGame(id, user, 1);
                }}
              >
                {!currUserGameInfo ? 'Join' : 'Switch'}
              </Button>
            )}
        </Col>
      </Row>
      <Row>
        {players[0] === authUser.displayName && (
          <Col>
            <Button
              block
              disabled={
                players.length !== 4 ||
                teamAPlayers.length !== teamBPlayers.length
              }
              onClick={() => firebase.startBidding(id)}
            >
              Start Game
            </Button>
          </Col>
        )}
      </Row> */}
    </div>
  );
};

export default GameLobby;
