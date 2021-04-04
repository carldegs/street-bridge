/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo } from 'react';
import { useHistory, useParams } from 'react-router';

import { useFirebase } from '../firebase/useFirebase';
import useRoomGameplay from '../hooks/useRoomGameplay';
import { Card, DefaultParams, Phase } from '../models';
import objToArr from '../utils/array';

import SmallCard from './SmallCard';
import TeamScoreStat from './TeamScoreStat';

const EndgameDrawer: React.FC = () => {
  const { id } = useParams<DefaultParams>();
  const {
    teamNames,
    gameWinner,
    isHost,
    game,
    gameError,
    rounds,
    sortedPlayers,
    auth,
  } = useRoomGameplay();
  const { phase } = game || {};
  const history = useHistory();
  const firebase = useFirebase();

  const roundsArr = useMemo(() => {
    if (!rounds) {
      return [];
    }

    return objToArr(rounds);
  }, [rounds]);

  if (!gameWinner) {
    return null;
  }

  return (
    <Drawer
      placement="top"
      size="xl"
      isOpen={phase === Phase.post}
      onClose={() => {}}
    >
      <DrawerOverlay />
      <DrawerContent maxW="container.xl">
        <DrawerHeader>{`${teamNames[gameWinner]} wins!`}</DrawerHeader>
        <DrawerBody>
          <Flex justifyContent="space-evenly" alignItems="center" mb={8}>
            <TeamScoreStat team={0} />
            <TeamScoreStat team={1} />
          </Flex>

          <Table variant="striped">
            <Thead>
              <Tr>
                <Th fontStyle="normal" fontSize="lg">
                  Players
                </Th>
                {roundsArr.map((round, i) => (
                  <Th fontSize="lg" key={`round-num-${JSON.stringify(round)}`}>
                    {i + 1}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {sortedPlayers.map(player => (
                <Tr key={`row-${player}`}>
                  <Td>{player}</Td>
                  {roundsArr.map(round => (
                    <Td key={`${player}-${JSON.stringify(round)}`}>
                      <SmallCard
                        card={round[player] as Card}
                        isDisabled={round.winningPlayer !== player}
                      />
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DrawerBody>

        <DrawerFooter>
          {isHost && (
            <Button
              onClick={() => {
                firebase.resetGame(id, game.players);
                history.push(`/game/lobby/${id}`);
              }}
            >
              Play Again
            </Button>
          )}
          {isHost && <Button>Delete Room</Button>}
          {!isHost && (
            <Button
              isDisabled={gameError !== 'no-game'}
              onClick={() => {
                if (gameError !== 'no-game') {
                  firebase.deleteGame(id);
                }

                auth.setAuthUserGame(null);
                history.push('/home');
              }}
              rightIcon={
                gameError !== 'no-game' ? (
                  <FontAwesomeIcon icon="spinner" pulse />
                ) : undefined
              }
            >
              {gameError === 'no-game' ? 'Back to Home' : 'Waiting for host'}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EndgameDrawer;
