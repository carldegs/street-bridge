import { shuffle, chunk } from 'lodash';

import { CardSuit, Card } from '../models';

export const createCard = (
  suit: CardSuit,
  value: number,
  turnUsed = -1
): Card => {
  return {
    suit,
    value,
    turnUsed,
  };
};

export const createSplitDeck = (): Card[][] => {
  let cards: Card[] = [];
  Object.keys(CardSuit)
    .filter(s => {
      return Number.isInteger(Number(s));
    })
    .forEach(suit => {
      Array.from(Array(13).keys()).forEach(value => {
        cards = [
          ...cards,
          createCard((Number(suit) as unknown) as CardSuit, value),
        ];
      });
    });

  return chunk(shuffle(cards), 13);
};
