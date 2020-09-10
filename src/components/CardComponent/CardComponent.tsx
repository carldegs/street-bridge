import React from 'react';
import cx from 'classnames';

import { Card } from '../../models';

import { getCardValue, getSuitString, getCardColor } from '../../utils/cards';

import styles from './Card.module.scss';

interface ICard {
  card?: Card;
  disabled?: boolean;
  onClick?: (card: Card) => void;
  style?: Record<string, any>;
  className?: string;
  small?: boolean;
}

const CardComponent: React.FC<ICard> = ({
  card,
  disabled,
  onClick,
  style,
  className,
  small,
}: ICard) =>
  card ? (
    <div
      className={cx(
        styles.card,
        styles[`bg${getCardColor(card.suit)}`],
        className,
        { [styles.disabled]: disabled, [styles.small]: small }
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
      {!small && (
        <div className={styles.cardValReverse}>{getCardValue(card.value)}</div>
      )}
    </div>
  ) : null;

export default CardComponent;
