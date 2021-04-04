/* eslint-disable no-shadow */
import React from 'react';
import { Container, Flex, Spacer, useBreakpointValue } from '@chakra-ui/react';
import { useParams } from 'react-router';

import CardHand from '../components/CardHand';
import RoomDeletedModal from '../components/RoomDeletedModal';
import { useGame } from '../firebase/hooks';
import { DefaultParams } from '../models';
import BidChat from '../components/BidChat';
import GameSettingsMenu from '../components/GameSettingsMenu';
import CurrentBidStat from '../components/CurrentBidStat';
import ScoresToWinStat from '../components/ScoresToWinStat';

const GameBid: React.FC = () => {
  const { id } = useParams<DefaultParams>();
  const { error: gameError } = useGame(id);
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Container maxW="container.lg" centerContent>
      <RoomDeletedModal
        isOpen={gameError === 'no-game'}
        onClose={() => undefined}
      />
      <GameSettingsMenu />

      {isMobile ? (
        <Flex flexDir="column" w="full">
          <Flex px={6} pb={6}>
            <CurrentBidStat />
            <Spacer />
            <ScoresToWinStat />
            <Spacer />
          </Flex>
          <BidChat />
        </Flex>
      ) : (
        <Flex w="full">
          <CurrentBidStat />
          <Spacer />
          <BidChat />
          <Spacer />
          <ScoresToWinStat />
        </Flex>
      )}

      <CardHand disableClick />
    </Container>
  );
};

export default GameBid;
