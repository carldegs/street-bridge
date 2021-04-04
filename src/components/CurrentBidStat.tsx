import React from 'react';

import useRoomBid from '../hooks/useRoomBid';
import { BidSuit } from '../models';
import { getSuitString } from '../utils/cards';
import { getColor } from '../utils/game';

import GameStat from './GameStat';

const CurrentBidStat: React.FC = () => {
  const { currBid, currBidTeam, currBidTeamName } = useRoomBid();

  return (
    <GameStat
      label="Current Bid"
      helpText={currBidTeamName}
      value={
        currBid?.value ? (
          <>
            {currBid.suit !== BidSuit.pass ? currBid.value : ''}
            <span className="font-weight-bold">
              {getSuitString(currBid.suit)}
            </span>
          </>
        ) : (
          'N/A'
        )
      }
      color={`${getColor(currBidTeam)}.500`}
    />
  );
};

export default CurrentBidStat;
