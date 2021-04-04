/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import range from 'lodash/range';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGame } from '../firebase/hooks';
import { BidSuit, DefaultParams } from '../models';
import { getSuitString } from '../utils/cards';

import useRoomLobbyData from './useRoomLobbyData';

// TODO: Combine to a Game/Room class with other hooks
const useRoomBid = () => {
  const { id } = useParams<DefaultParams>();
  const { game, error: gameError } = useGame(id);
  const { isAuthUserAPlayer, authUser } = useRoomLobbyData();

  const [bidValue, setBidValue] = useState<number | null>(null);
  const [bidSuit, setBidSuit] = useState<BidSuit | null>(null);

  const currBid = game.winBid;
  const currBidTeam = game.winTeam;
  const currPlayer = game.players[game.currPlayer];
  const currBidTeamName =
    game.winTeam !== null ? game.teamNames[game.winTeam] : '';

  let scoreToWin;

  if (currBid?.value) {
    const scores = [6 + currBid?.value, 8 - currBid?.value];
    scoreToWin = currBidTeam === 0 ? scores : scores.reverse();
  }

  const { value = 1, suit = BidSuit.none } = currBid || {};

  const validBids = range(value === 0 ? 1 : value, 7).filter(
    i => i !== value || (i === value && suit !== BidSuit.noTrump)
  );

  let validSuits: { label: string; value: BidSuit }[] = [];
  if (bidValue === value) {
    validSuits = range(suit, 7)
      .filter(i => i - 2 > suit && i - 2 !== BidSuit.pass)
      .map(i => ({
        label: getSuitString((i - 2) as BidSuit) as string,
        value: i - 2,
      }));
  } else {
    validSuits = range(5).map(i => ({
      label: getSuitString(i) as string,
      value: i,
    }));
  }

  useEffect(() => {
    if (bidValue === null || !validBids.some(bid => bid === bidValue)) {
      setBidValue(validBids[0]);
    }
  }, [validBids, bidValue]);

  return {
    id,
    game,
    gameError,
    currBid,
    currBidTeam,
    currBidTeamName,
    currPlayer,
    scoreToWin,
    validBids,
    validSuits,
    bidValue,
    bidSuit,
    isAuthUserAPlayer,
    setBidValue,
    setBidSuit,
    authUser,
  };
};

export default useRoomBid;
