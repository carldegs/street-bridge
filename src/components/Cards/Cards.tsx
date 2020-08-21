import React from 'react';
import cx from 'classnames';

import { Row, Col } from 'react-bootstrap';

import { getCardValue, getSuitString } from '../../utils/cards';
import { Card, CardSuit } from '../../models';

import styles from './Cards.module.scss';

interface ICards {
  cards: Card[];
}

const getCardColor = (suit: CardSuit) => {
  switch (suit) {
    case CardSuit.club:
      return 'Purple';
    case CardSuit.spade:
      return 'Blue';
    case CardSuit.diamond:
      return 'Yellow';
    case CardSuit.heart:
    default:
      return 'Red';
  }
};

const Cards: React.FC<ICards> = ({ cards }: ICards) => {
  return (
    <Row style={{ width: '100%' }}>
      <Col className={styles.cards}>
        {cards.map((card, i) => (
          <div
            key={`${card.value}${card.suit}`}
            className={cx(styles.card, styles[`bg${getCardColor(card.suit)}`])}
            style={{ zIndex: i }}
          >
            <div className={styles.cardVal}>{getCardValue(card.value)}</div>
            <div className={styles.cardSuit}>{getSuitString(card.suit)}</div>
            <div className={styles.cardValReverse}>
              {getCardValue(card.value)}
            </div>
          </div>
        ))}
      </Col>
    </Row>
  );
};

export default Cards;
