import {
  DrawerProps,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  Flex,
  Thead,
  Table,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';

import useRoomGameplay from '../hooks/useRoomGameplay';
import { Card } from '../models';
import { Abort } from '../types/Abort';
import objToArr from '../utils/array';

import SmallCard from './SmallCard';
import TeamScoreStat from './TeamScoreStat';

const RecapDrawer: React.FC<Abort<DrawerProps>> = ({
  isOpen,
  onClose,
}: Abort<DrawerProps>) => {
  const { rounds, sortedPlayers } = useRoomGameplay();
  const teamColors = ['green', 'orange'];

  const roundsArr = useMemo(() => {
    if (!rounds) {
      return [];
    }

    return objToArr(rounds);
  }, [rounds]);

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Game Recap</DrawerHeader>
        <Flex justifyContent="space-evenly" mb={8}>
          <TeamScoreStat team={0} />
          <TeamScoreStat team={1} />
        </Flex>
        <Table variant="striped" fontSize={['sm', 'md']}>
          <Thead>
            <Tr>
              <Th fontStyle="normal" isNumeric fontSize="lg">
                Round
              </Th>
              {sortedPlayers &&
                sortedPlayers.map(player => (
                  <Th key={`header-${player}`} fontSize="lg" textAlign="center">
                    {player}
                  </Th>
                ))}
            </Tr>
          </Thead>
          <Tbody>
            {roundsArr.map((round, i) => (
              <Tr key={round.winningPlayer}>
                <Td
                  fontSize="2xl"
                  fontWeight="bold"
                  textAlign="center"
                  color={`${teamColors[round.winningTeam]}.400`}
                >
                  {i + 1}
                </Td>
                {sortedPlayers &&
                  sortedPlayers.map(player => {
                    const card = round[player] as Card;
                    return (
                      <Td key={`${player}-round-${i + 1}`}>
                        <Flex w="full" justifyContent="center">
                          <SmallCard
                            card={card}
                            isDisabled={round.winningPlayer !== player}
                          />
                        </Flex>
                      </Td>
                    );
                  })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </DrawerContent>
    </Drawer>
  );
};

export default RecapDrawer;
