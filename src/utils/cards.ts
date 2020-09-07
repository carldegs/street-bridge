import { shuffle, chunk } from 'lodash';

import { CardSuit, Card, BidSuit } from '../models';

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

export const isDeckMisdeal = (deck: Card[][]): boolean =>
  deck.some(cards => !cards.some(card => card.value >= 9));

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

  let splitDeck = chunk(shuffle(cards), 13);
  while (isDeckMisdeal(splitDeck)) {
    splitDeck = chunk(shuffle(cards), 13);
  }

  return splitDeck;
};

export const getCardValue = (value: number): string => {
  switch (value) {
    case 9:
      return 'J';
    case 10:
      return 'Q';
    case 11:
      return 'K';
    case 12:
      return 'A';
    default:
      return `${value + 2}`;
  }
};

export const getSuitString = (
  value: BidSuit | CardSuit
): string | undefined => {
  switch (value) {
    case BidSuit.pass:
      return 'PASS!';
    case BidSuit.noTrump:
      return 'NT';
    case BidSuit.spade:
    case CardSuit.spade:
      return '♠';
    case BidSuit.heart:
    case CardSuit.heart:
      return '♥';
    case BidSuit.diamond:
    case CardSuit.diamond:
      return '♦';
    case BidSuit.club:
    case CardSuit.club:
      return '♣';
    case BidSuit.none:
    default:
      return undefined;
  }
};
