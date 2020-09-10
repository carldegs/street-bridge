/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlayerBid } from '../models';

export const toBidsArray = (bids?: Record<number, PlayerBid>): PlayerBid[] => {
  if (!bids) {
    return [];
  }

  return Object.entries(bids)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([_, bid]) => bid);
};

export const getScoreToWin = (isCurrTeam: boolean, bidValue: number): number =>
  isCurrTeam ? 6 + bidValue : 8 - bidValue;
