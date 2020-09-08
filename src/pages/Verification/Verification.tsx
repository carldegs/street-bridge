import React from 'react';

import { useLocation } from 'react-router-dom';

import styles from './Verification.module.scss';

const Verification: React.FC = () => {
  const { state } = useLocation();
  const { email } = state || {};

  return (
    <div className={styles.Verification}>
      <div className={styles.logo}>
        <div className={styles.street}>Street</div>
        <div className={styles.bridge}>Bridge</div>
      </div>
      <h1>One more step!</h1>
      <h4 className="mb-4">
        We have sent an email to
        <b>{email}</b>
      </h4>

      <p style={{ maxWidth: '520px' }} className="mb-5">
        You need to verify your email to continue. If you not have received the
        verification email, please check your Spam or Bulk Email folder.
      </p>
    </div>
  );
};
export default Verification;
