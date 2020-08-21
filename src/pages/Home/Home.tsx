import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col } from 'react-bootstrap';
import cx from 'classnames';

import { useHistory } from 'react-router-dom';

import { sample } from 'lodash';

import { useFirebase } from '../../firebase/useFirebase';

import { useStore } from '../../store/store';

import { useGames } from '../../firebase/hooks';

import SBButton from '../../components/SBButton/SBButton';

import styles from './Home.module.scss';

const Home: React.FC = () => {
  const history = useHistory();
  const firebase = useFirebase();
  const store = useStore();
  const username = store.authUser.displayName || '';

  const games = useGames();

  useEffect(() => {
    let gameId = '';

    games.forEach(game => {
      if (game.userJoined) {
        gameId = game.id;
      }
    });

    if (gameId) {
      history.push(`/game/${gameId}`);
    }
  }, [games, history]);

  return (
    <div className={styles.Home} data-testid="Home">
      <div className={styles.content}>
        <Row style={{ height: '42px' }}>
          <Col className="float-right">
            <SBButton
              outline
              color="red"
              onClick={() => {
                firebase.createGame(username);
              }}
            >
              <FontAwesomeIcon icon="plus" className="mr-2" />
              CREATE GAME
            </SBButton>
          </Col>
        </Row>
        <Row>
          {games.map(game => (
            <Col xs={6} key={game.id} className={styles.game}>
              <div
                className={cx(
                  styles.gameHeader,
                  styles[
                    sample([
                      'red',
                      'purple',
                      'blue',
                      'yellow',
                      'green',
                      'cyan',
                    ]) as string
                  ]
                )}
              >
                <div className={styles.gameTitle}>{game.name}</div>
                <div className={styles.gameInfo}>
                  <div className="mr-5">
                    <FontAwesomeIcon icon="user-friends" className="mr-2" />
                    {game.numPlayers}
                    /4
                  </div>
                  <div>
                    <FontAwesomeIcon icon="fingerprint" className="mr-2" />
                    {game.id}
                  </div>
                </div>
              </div>
              <div className={cx(styles.gameActions, 'float-right')}>
                <SBButton
                  outline
                  className="mr-3"
                  onClick={() => firebase.deleteGame(game.id)}
                >
                  DELETE
                </SBButton>
                <SBButton onClick={() => history.push(`/game/${game.id}`)}>
                  JOIN
                </SBButton>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
