import React from 'react';

import styles from './GameCard.module.scss';

const GameCard: React.FC = () => (
  <div className={styles.GameCard} data-testid="GameCard">
    GameCard Component
  </div>
);

export default GameCard;
