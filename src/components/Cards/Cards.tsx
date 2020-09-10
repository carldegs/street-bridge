import React, { useState, useRef, useEffect } from 'react';
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
  const [tempDisable, setTempDisable] = useState(false);
  const ref = useRef((0 as unknown) as ReturnType<typeof setTimeout>);
  const finalCards = cards.filter(card => card.turnUsed === -1);

  useEffect(() => {
    return () => {
      clearTimeout(ref.current);
    };
  }, []);

  return (
    <Row style={{ width: '100%', margin: 0, justifyContent: 'center' }}>
      <Col
        className={cx(styles.cards, {
          [styles.disabled]: !!disabled,
        })}
        style={{ maxWidth: `${68 * (finalCards.length + 0.5)}px` }}
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
              disabled={isDisabled || tempDisable}
              onClick={() => {
                if (!isDisabled && !!onClick && !tempDisable) {
                  onClick(card);

                  setTempDisable(true);
                  ref.current = setTimeout(() => {
                    setTempDisable(false);
                  }, 2000);
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
