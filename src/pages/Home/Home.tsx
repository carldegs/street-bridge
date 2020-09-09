import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col, Modal, Form } from 'react-bootstrap';
import cx from 'classnames';
import { useHistory } from 'react-router-dom';
import { sample, camelCase } from 'lodash';

import { useFirebase } from '../../firebase/useFirebase';
import { useGames } from '../../firebase/hooks';
import SBButton from '../../components/SBButton/SBButton';
import { useAuth } from '../../store/useAuth';
import { Game } from '../../models';

import styles from './Home.module.scss';

const Home: React.FC = () => {
  const history = useHistory();
  const firebase = useFirebase();
  const auth = useAuth();
  const username = auth.state.authUser?.displayName || '';
  const [showNameModal, setShowNameModal] = useState(false);
  const [gameName, setGameName] = useState('');
  const [allowCreateGame, setAllowCreateGame] = useState(false);
  const [newUsername, setNewUsername] = useState(
    camelCase(auth.state.authUser?.displayName || '').replace('.', '')
  );
  const [allowSetup, setAllowSetup] = useState(
    !!newUsername && username !== newUsername && !newUsername.includes('.')
  );

  const games = useGames();

  return (
    <div className={styles.Home} data-testid="Home">
      <Modal show={firebase.isGoogleUserFirstLogin()} backdrop="static">
        <Modal.Header>{`Hi ${auth.state.authUser?.displayName}!`}</Modal.Header>
        <Modal.Body>
          <div className="font-weight-bold mb-4">Setup your account</div>
          <Form.Group controlId="newUsername">
            <Form.Label className={styles.gameNameModalLabel}>
              Username
            </Form.Label>
            <Form.Control
              value={newUsername}
              onChange={e => {
                setNewUsername(e.target.value);
                setAllowSetup(
                  !!e.target.value &&
                    username !== e.target.value &&
                    !e.target.value.includes('.')
                );
              }}
              onBlur={() => {
                setAllowSetup(
                  !!newUsername &&
                    username !== newUsername &&
                    !newUsername.includes('.')
                );
              }}
              style={{ color: 'white' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <SBButton
            color="green"
            disabled={!allowSetup}
            onClick={async () => {
              await firebase.updateUser({
                displayName: newUsername,
              });
              history.go(0);
            }}
          >
            SUBMIT
          </SBButton>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showNameModal}
        onHide={() => {
          setShowNameModal(false);
          setGameName('');
          setAllowCreateGame(false);
        }}
      >
        <Modal.Header closeButton>
          <div className={styles.gameNameModalTitle}>Create Room</div>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="gameName">
            <Form.Label className={styles.gameNameModalLabel}>
              Room Name
            </Form.Label>
            <Form.Control
              value={gameName}
              onChange={e => {
                setGameName(e.target.value);
              }}
              onBlur={() => {
                setAllowCreateGame(!!gameName);
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <SBButton
            outline
            color="green"
            disabled={!allowCreateGame}
            onClick={async () => {
              const id = await firebase.createGame(username, gameName);
              const game = await firebase.games.doc(id).get();
              auth.setAuthUserGame(game.data() as Game);
              history.push(`/game/lobby/${id}`);
            }}
          >
            CREATE ROOM
          </SBButton>
        </Modal.Footer>
      </Modal>
      <div className={styles.content}>
        <Row style={{ height: '42px' }}>
          <Col className="d-flex justify-content-end">
            <SBButton
              outline
              color="red"
              onClick={() => setShowNameModal(true)}
            >
              <FontAwesomeIcon icon="plus" className="mr-2" />
              CREATE ROOM
            </SBButton>
          </Col>
        </Row>
        <Row>
          {!games.length && (
            <Col>
              <div className={styles.noGames}>
                No rooms found. Create one now!
              </div>
            </Col>
          )}
          {games.map(game => {
            const color = sample([
              'red',
              'purple',
              'blue',
              'yellow',
              'green',
              'cyan',
            ]) as string;

            return (
              <Col xs={6} key={game.id} className={styles.game}>
                <div className={cx(styles.gameHeader, styles[color])}>
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
                    onClick={() => {
                      history.push(`/game/lobby/${game.id}`);
                    }}
                    outline
                    color={color}
                  >
                    {game.numPlayers < 4 ? 'JOIN' : 'SPECTATE'}
                  </SBButton>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default Home;
