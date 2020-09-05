import React from 'react';
import cx from 'classnames';

import { Card, CardSuit } from '../../models';

import { getCardValue, getSuitString } from '../../utils/cards';

import styles from './Card.module.scss';

interface ICard {
  card?: Card;
  disabled?: boolean;
  onClick?: (card: Card) => void;
  style?: Record<string, any>;
  className?: string;
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

const CardComponent: React.FC<ICard> = ({
  card,
  disabled,
  onClick,
  style,
  className,
}: ICard) =>
  card ? (
    <div
      className={cx(
        styles.card,
        styles[`bg${getCardColor(card.suit)}`],
        className,
        { [styles.disabled]: disabled }
      )}
      style={style}
      onClick={() => {
        if (!disabled && !!onClick) {
          onClick(card);
        }
      }}
    >
      <div className={styles.cardVal}>{getCardValue(card.value)}</div>
      <div className={styles.cardSuit}>{getSuitString(card.suit)}</div>
      <div className={styles.cardValReverse}>{getCardValue(card.value)}</div>
    </div>
  ) : null;

export default CardComponent;
