import {
  Box,
  Container,
  Flex,
  Spacer,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router';

import CardHand from '../components/CardHand';
import CurrentBidStat from '../components/CurrentBidStat';
import GameSettingsMenu from '../components/GameSettingsMenu';
import RoomDeletedModal from '../components/RoomDeletedModal';
import TeamScoreStat from '../components/TeamScoreStat';
import EndgameDrawer from '../components/EndgameDrawer';
import { useGame } from '../firebase/hooks';
import { DefaultParams, Phase } from '../models';
import GameTable from '../components/GameTable';

const GamePlay: React.FC = () => {
  const { id } = useParams<DefaultParams>();
  const { game, error: gameError } = useGame(id);
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Container maxW="container.xl" centerContent>
      <RoomDeletedModal
        isOpen={gameError === 'no-game' && game.phase !== Phase.post}
        onClose={() => undefined}
      />
      <GameSettingsMenu />
      <EndgameDrawer />
      {isMobile ? (
        <Flex flexDir="column" w="full">
          <Flex justifyContent="space-evenly" px={6} pb={6}>
            <CurrentBidStat />
            <TeamScoreStat team={0} />
            <TeamScoreStat team={1} />
          </Flex>
          <GameTable />
        </Flex>
      ) : (
        <Flex w="full" alignItems="center">
          <CurrentBidStat />
          <Spacer />
          <Box flexGrow={1}>
            <GameTable />
          </Box>
          <Spacer />
          <Stack spacing={8}>
            <TeamScoreStat team={0} />
            <TeamScoreStat team={1} />
          </Stack>
        </Flex>
      )}
      <CardHand />
    </Container>
  );
};

export default GamePlay;
