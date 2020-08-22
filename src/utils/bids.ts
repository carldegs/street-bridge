/* eslint-disable @typescript-eslint/no-unused-vars */
import { PlayerBid } from '../models';

const toBidsArray = (bids?: Record<number, PlayerBid>): PlayerBid[] => {
  if (!bids) {
    return [];
  }

  return Object.entries(bids)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([_, bid]) => bid);
};

export default toBidsArray;
