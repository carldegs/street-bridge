import React from 'react';
import cx from 'classnames';
import { Row, Col } from 'react-bootstrap';

import { useFirebase } from '../../firebase/useFirebase';
import { useAuth } from '../../store/useAuth';

import styles from './SBNavbar.module.scss';

interface ISBNavbar {
  children: any;
  title?: string;
}

const SBNavbar: React.FC<ISBNavbar> = ({ children, title }: ISBNavbar) => {
  const firebase = useFirebase();
  const auth = useAuth();

  return (
    <div>
      <Row className={styles.SBNavbar} data-testid="SBNavbar">
        <Col className={styles.logo}>
          <div className={styles.street}>Street</div>
          <div className={styles.bridge}>Bridge</div>
        </Col>
        <Col className={styles.pageTitle}>{title}</Col>
        <Col className={cx(styles.logout, 'float-right')}>
          <div
            onClick={() => {
              firebase.logoutUser();
              auth.logout();
            }}
          >
            Logout
          </div>
        </Col>
      </Row>
      <div className={styles.children}>{children}</div>
    </div>
  );
};

export default SBNavbar;
