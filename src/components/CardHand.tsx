import React, { useEffect, useMemo, useState } from 'react';
import {
  HStack,
  Container,
  Popover,
  PopoverTrigger,
  Button,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  IconButton,
} from '@chakra-ui/react';
import { useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sortBy } from 'lodash';

import useRoomLobbyData from '../hooks/useRoomLobbyData';
import { DefaultParams, Phase } from '../models';
import { isCardPlayable } from '../utils/cards';
import useRoomGameplay from '../hooks/useRoomGameplay';
import { useFirebase } from '../firebase/useFirebase';

import CardComponent from './CardComponent';
import MotionFlex from './motion/MotionFlex';

interface CardHandProps {
  disableClick?: boolean;
}

const CardHand: React.FC<CardHandProps> = ({
  disableClick = false,
}: CardHandProps) => {
  const { id } = useParams<DefaultParams>();
  const [spectatedPlayer, setSpectatedPlayer] = useState('');
  const [autoSpectate, setAutoSpectate] = useState(true);

  const { isSpectator, isAuthUserAPlayer, game, authUser } = useRoomLobbyData();
  const { players, currPlayer, phase } = game;
  const { isFirstPlayer, roundSuit } = useRoomGameplay();
  const [tempDisabled, setTempDisabled] = useState(false);
  const firebase = useFirebase();

  // TODO: get values
  const disabled = false;

  const isGameplay = phase === Phase.game;
  const isCurrPlayer = authUser.displayName === players[currPlayer];

  useEffect(() => {
    if (autoSpectate && !isAuthUserAPlayer) {
      setSpectatedPlayer(players[currPlayer]);
    }
  }, [autoSpectate, isAuthUserAPlayer]);

  const userHand = useMemo(
    () =>
      authUser.displayName
        ? sortBy(
            game.playerInfo[
              isSpectator ? spectatedPlayer : authUser.displayName
            ]?.cards.filter(card => card.turnUsed === -1) || [],
            ['suit', 'value']
          )
        : [],
    [isSpectator, game, spectatedPlayer, authUser]
  );

  if (!userHand.length) {
    return null;
  }

  return (
    <Container
      maxW="full"
      width="full"
      position="fixed"
      bottom={[-8, -8, -8, 8]}
      id="card-hand"
    >
      {isSpectator && (
        <HStack>
          <Popover trigger="hover">
            <PopoverTrigger>
              <IconButton
                aria-label="Auto-spectate"
                variant={autoSpectate ? 'outline' : 'solid'}
                colorScheme="green"
                onClick={() => {
                  setAutoSpectate(true);
                }}
                icon={<FontAwesomeIcon icon="robot" />}
              />
              <PopoverContent zIndex={4}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Auto-spectate</PopoverHeader>
                <PopoverBody>
                  Automatically show current player&apos;s cards
                </PopoverBody>
              </PopoverContent>
            </PopoverTrigger>
          </Popover>
          {players.map(player => (
            <Button
              variant={player === spectatedPlayer ? 'solid' : 'outline'}
              key={player}
            >
              {player}
            </Button>
          ))}
        </HStack>
      )}
      <MotionFlex
        alignItems="center"
        justifyContent="center"
        flexWrap="nowrap"
        variants={{
          visible: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              staggerChildren: 0.05,
            },
          },
          hidden: {
            opacity: 0,
            transition: {
              when: 'afterChildren',
            },
          },
        }}
        initial="hidden"
        animate={userHand.length ? 'visible' : undefined}
        px={[4, 'inherit']}
      >
        {userHand.map(card => {
          const isPlayable = isCardPlayable(
            userHand,
            card,
            isFirstPlayer,
            roundSuit,
            disabled
          );

          const isCardDisabled = isGameplay && (!isCurrPlayer || !isPlayable);

          return (
            <CardComponent
              key={`${card.value}-${card.suit}`}
              card={card}
              isDisabled={isCardDisabled}
              disableClick={
                isSpectator || disableClick || isCardDisabled || tempDisabled
              }
              marginLeft={['-20px', -6, -6, -4]}
              marginRight={['-20px', -6, -6, -4]}
              onClick={() => {
                if (
                  !isCardDisabled &&
                  !isSpectator &&
                  id &&
                  authUser.displayName
                ) {
                  setTempDisabled(true);
                  setTimeout(() => setTempDisabled(false), 2000);
                  firebase.playCard(id, authUser.displayName, card);
                }
              }}
            />
          );
        })}
      </MotionFlex>
    </Container>
  );
};

export default CardHand;
