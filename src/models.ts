export enum Phase {
  lobby = 0,
  bid,
  game,
  post,
}

export enum CardSuit {
  club = 0,
  spade,
  heart,
  diamond,
}

export enum BidSuit {
  none = -2,
  pass = -1,
  club = 0,
  spade,
  heart,
  diamond,
  noTrump,
}

export interface Card {
  suit: CardSuit;
  value: number;
  turnUsed: number;
}

export interface Bid {
  suit: BidSuit;
  value: number;
}

export interface PlayerBid extends Bid {
  username: string;
}

export interface PlayerInfo {
  username: string;
  team: number;
  bid: Bid;
  cards: Card[];
  isHost: boolean;
}

export interface Game {
  name: string;
  players: string[];
  playerInfo: Record<string, PlayerInfo>;
  phase: Phase;
  winBid: Bid | null;
  winTeam: number | null;
  currPlayer: number;
  score: [number, number];
  bids: Record<number, PlayerBid>;
}
