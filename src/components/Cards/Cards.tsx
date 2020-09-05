import React from 'react';
import cx from 'classnames';

import { Row, Col } from 'react-bootstrap';

import { Card, CardSuit, BidSuit } from '../../models';

import CardComponent from '../CardComponent/CardComponent';

import styles from './Cards.module.scss';

interface ICards {
  cards: Card[];
  roundSuit?: BidSuit;
  isFirstPlayer?: boolean;
  disabled?: boolean;
  onClick?: (card: Card) => void;
}

const checkIfCardPlayable = (
  cards: Card[],
  card: Card,
  isFirstPlayer: boolean,
  roundSuit: BidSuit,
  disabled = false
): boolean => {
  if (disabled) {
    return false;
  }

  if (isFirstPlayer) {
    return true;
  }

  if (
    cards.some(c => c.suit === ((roundSuit as unknown) as CardSuit)) &&
    card.suit !== ((roundSuit as unknown) as CardSuit)
  ) {
    return false;
  }

  return true;
};

const Cards: React.FC<ICards> = ({
  cards,
  disabled,
  onClick,
  roundSuit = BidSuit.noTrump,
  isFirstPlayer = false,
}: ICards) => {
  const finalCards = cards.filter(card => card.turnUsed === -1);
  return (
    <Row style={{ width: '100%' }}>
      <Col
        className={cx(styles.cards, {
          [styles.disabled]: !!disabled,
        })}
      >
        {finalCards.map((card, i) => {
          const isDisabled = !checkIfCardPlayable(
            finalCards,
            card,
            isFirstPlayer,
            roundSuit,
            disabled
          );
          return (
            <CardComponent
              key={`${card.value}${card.suit}`}
              card={card}
              style={{ zIndex: i }}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && !!onClick) {
                  onClick(card);
                }
              }}
              className={styles.card}
            />
          );
        })}
      </Col>
    </Row>
  );
};

export default Cards;
