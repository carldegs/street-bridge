import { HStack, useBreakpointValue, Text } from '@chakra-ui/react';
import React from 'react';

import useRoomBid from '../hooks/useRoomBid';
import { getColor } from '../utils/game';

import GameStat from './GameStat';

const ScoresToWinStat: React.FC = () => {
  const { scoreToWin } = useRoomBid();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <GameStat
      label="Score to Win"
      value={
        <>
          <HStack spacing={2}>
            {scoreToWin &&
              scoreToWin.map((score, i) => (
                <>
                  <Text
                    fontSize={isMobile ? '4xl' : '6xl'}
                    color={`${getColor(i)}.500`}
                  >
                    {score}
                  </Text>
                  {i === 0 && (
                    <Text
                      fontSize={isMobile ? '4xl' : '6xl'}
                      color="brandDark.700"
                    >
                      -
                    </Text>
                  )}
                </>
              ))}
          </HStack>
          {!scoreToWin && (
            <Text fontSize={isMobile ? '4xl' : '6xl'} color="brandDark.700">
              N/A
            </Text>
          )}
        </>
      }
    />
  );
};

export default ScoresToWinStat;
