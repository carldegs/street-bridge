import React, { useState } from 'react';
import cx from 'classnames';
import { Row, Col, Modal, Form, Alert } from 'react-bootstrap';

import { useFirebase } from '../../firebase/useFirebase';
import { useAuth } from '../../store/useAuth';
import SBButton from '../SBButton/SBButton';

import styles from './SBNavbar.module.scss';

interface ISBNavbar {
  children: any;
  title?: string;
}

const SBNavbar: React.FC<ISBNavbar> = ({ children, title }: ISBNavbar) => {
  const firebase = useFirebase();
  const auth = useAuth();

  // TODO: Create useReducer instead
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPWModal, setShowResetPWModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [allowResetPassword, setAllowResetPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const isPasswordSignin = firebase.getUserSignInMethod().includes('password');

  // TODO: Convert to reusable components
  return (
    <div>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>Delete Account</Modal.Header>
        <Modal.Body>
          <div>Sure ka na ba???</div>
          {isPasswordSignin && (
            <Form.Group controlId="password">
              <Form.Label style={{ color: '#E9EBF9' }}>Password</Form.Label>
              <Form.Control
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                }}
                type="password"
              />
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer>
          <SBButton
            className="mr-4"
            disabled={isPasswordSignin && !password}
            onClick={async () => {
              if (auth.state.authUser?.email) {
                await firebase.deleteUser(auth.state.authUser.email, password);
                // TODO: Show modal to confirm user is deleted
                // and show button to redirect to the landing page
                firebase.logoutUser();
                auth.logout();
              }
            }}
          >
            YES
          </SBButton>
          <SBButton
            outline
            color="green"
            onClick={() => setShowDeleteModal(false)}
          >
            NO
          </SBButton>
        </Modal.Footer>
      </Modal>
      <Modal show={showResetPWModal} onHide={() => setShowResetPWModal(false)}>
        <Modal.Header closeButton>Reset Password</Modal.Header>
        <Modal.Body>
          <Form.Group controlId="password">
            <Form.Label style={{ color: '#E9EBF9' }}>Password</Form.Label>
            <Form.Control
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
              onBlur={() => {
                setAllowResetPassword(!!password && password.length >= 8);
              }}
              type="password"
            />
            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          </Form.Group>
          <Form.Group controlId="newPassword">
            <Form.Label style={{ color: '#E9EBF9' }}>New Password</Form.Label>
            <Form.Control
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
              }}
              onBlur={() => {
                setAllowResetPassword(!!newPassword && newPassword.length >= 8);
              }}
              type="password"
            />
          </Form.Group>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <SBButton
            outline
            color="green"
            disabled={!allowResetPassword || !auth.state.authUser?.email}
            onClick={async () => {
              setAllowResetPassword(false);
              if (auth.state.authUser?.email) {
                firebase
                  .updatePassword(
                    auth.state.authUser.email,
                    password,
                    newPassword
                  )
                  .then(() => setShowResetPWModal(false))
                  .catch((err: any) => {
                    setPasswordError(err.message);
                    setAllowResetPassword(true);
                  });
              }
            }}
          >
            UPDATE PASSWORD
          </SBButton>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        size="sm"
      >
        <Modal.Header closeButton />
        <Modal.Body className="d-flex flex-column align-items-center justify-content-center mb-4">
          <span
            style={{ fontSize: '24px', marginTop: '-36px' }}
            className="mb-2 font-weight-bold"
          >
            SETTINGS
          </span>
          {isPasswordSignin && (
            <SBButton
              outline
              color="cyan"
              className="mt-3"
              onClick={() => {
                setShowResetPWModal(true);
                setShowSettingsModal(false);
              }}
            >
              RESET PASSWORD
            </SBButton>
          )}
          <SBButton
            outline
            color="red"
            className="mt-3"
            onClick={() => {
              setShowDeleteModal(true);
              setShowSettingsModal(false);
            }}
          >
            DELETE ACCOUNT
          </SBButton>
          <SBButton
            outline
            color="red"
            onClick={() => {
              firebase.logoutUser();
              auth.logout();
            }}
            className="mt-3"
          >
            LOGOUT
          </SBButton>
        </Modal.Body>
      </Modal>
      <Row className={styles.SBNavbar} data-testid="SBNavbar">
        <Col className={styles.logo}>
          <div className={styles.street}>Street</div>
          <div className={styles.bridge}>Bridge</div>
        </Col>
        <Col className={styles.pageTitle}>{title}</Col>
        <Col className="d-flex align-items-center justify-content-end">
          <div
            className={cx(styles.userButton, 'float-right')}
            onClick={() => setShowSettingsModal(true)}
          >
            <div className={styles.username}>
              {auth.state?.authUser?.displayName || ''}
            </div>
            <div className={styles.settingsButton}>SETTINGS</div>
            {/* <div className={styles.logoutButton}>LOGOUT</div> */}
          </div>
        </Col>
      </Row>
      <div className={styles.children}>{children}</div>
    </div>
  );
};

export default SBNavbar;
