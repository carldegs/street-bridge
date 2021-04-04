import {
  useBreakpointValue,
  Flex,
  Box,
  Button,
  ButtonGroup,
  Spacer,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useParams } from 'react-router';

import { useFirebase } from '../firebase/useFirebase';
import useRoomBid from '../hooks/useRoomBid';
import { PlayerBid, PlayerInfo, BidSuit, DefaultParams } from '../models';
import theme from '../theme';
import { toBidsArray } from '../utils/bids';
import { getSuitString } from '../utils/cards';
import { getColor } from '../utils/game';

import MotionText from './motion/MotionText';

interface ChatBubbleProps {
  bid?: PlayerBid;
  currPlayer?: string;
  playerInfo: Record<string, PlayerInfo>;
  displayName: string | null;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  bid,
  playerInfo,
  displayName,
  currPlayer,
}: ChatBubbleProps) => {
  const { username, suit, value } = bid || {};

  return (
    <Flex key={bid ? `${username}-${suit}-${value}` : `${currPlayer}-bidding`}>
      {(username || currPlayer) === displayName && <Spacer />}
      <Box>
        <Text>{username || currPlayer}</Text>
        <Box
          py={1}
          borderRadius={12}
          bg={`${getColor(
            playerInfo[username || (currPlayer as string)]?.team || 0
          )}.300`}
          minW="110px"
          textAlign="center"
        >
          {suit !== undefined ? (
            <Text fontSize="2xl">
              {suit !== BidSuit.pass && value}
              {getSuitString(suit)}
            </Text>
          ) : (
            <Spinner mt={2} />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

const BidChat: React.FC = () => {
  const {
    game,
    authUser,
    currPlayer,
    validBids,
    validSuits,
    bidValue,
    bidSuit,
    setBidSuit,
    setBidValue,
  } = useRoomBid();
  const { id } = useParams<DefaultParams>();
  const firebase = useFirebase();
  const { bids, playerInfo } = game || {};
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [buttonClicked, setButtonClicked] = useState(false);

  return (
    <Flex flexDir="column" alignItems="center" justifyContent="center">
      <Flex
        w={isMobile ? 'full' : '360px'}
        bg="brandDark.700"
        borderRadius={32}
        h={isMobile ? '500px' : '600px'}
        p={8}
        flexDir="column"
      >
        <Stack spacing={2} flexGrow={1}>
          {bids &&
            toBidsArray(bids).map(bid => (
              <ChatBubble
                key={`${bid.username}-${bid.suit}-${bid.value}`}
                bid={bid}
                playerInfo={playerInfo}
                displayName={authUser.displayName}
              />
            ))}
          <ChatBubble
            currPlayer={currPlayer}
            playerInfo={playerInfo}
            displayName={authUser.displayName}
          />
        </Stack>
        {currPlayer === authUser.displayName && (
          <Box bg="purple.900" m={-8} borderBottomRadius={32} p={6}>
            <Flex justifyContent="space-around" alignItems="center">
              {validBids.map(bv => (
                <MotionText
                  key={bv}
                  fontSize="2xl"
                  opacity={bv === bidValue ? 1 : 0.5}
                  cursor="pointer"
                  fontWeight="bold"
                  px={2}
                  py={1}
                  textAlign="center"
                  borderRadius={4}
                  backgroundColor="transparent"
                  // TODO: FIX!
                  _hover={{
                    backgroundColor: theme.colors.brandYellow,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.1,
                  }}
                  onClick={() => {
                    setBidValue(bv);
                    setBidSuit(null);
                  }}
                >
                  {bv}
                </MotionText>
              ))}
            </Flex>
            <Flex mt={2} justifyContent="space-around" alignItems="center">
              {validSuits.map(bs => (
                <MotionText
                  key={bs.value}
                  fontSize={bs.label === 'NT' ? '2xl' : '3xl'}
                  opacity={bs.value === bidSuit ? 1 : 0.5}
                  cursor="pointer"
                  fontWeight="bold"
                  px={2}
                  py={1}
                  pt={bs.label === 'NT' ? 1 : 0}
                  mt={bs.label === 'NT' ? 0 : -2}
                  textAlign="center"
                  borderRadius={4}
                  backgroundColor="transparent"
                  // TODO: Fix
                  _hover={{
                    backgroundColor: theme.colors.brandYellow,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.1,
                  }}
                  onClick={() => setBidSuit(bs.value)}
                >
                  {bs.label}
                </MotionText>
              ))}
            </Flex>
            <ButtonGroup w="full" mt={4}>
              <Button
                colorScheme="red"
                isLoading={buttonClicked}
                onClick={() => {
                  setButtonClicked(true);
                  setTimeout(() => setButtonClicked(false), 2000);

                  if (authUser.displayName) {
                    firebase.setBid(id, authUser.displayName, {
                      value: 1,
                      suit: BidSuit.pass,
                    });
                  }
                }}
              >
                PASS
              </Button>
              <Button
                colorScheme="purple"
                isLoading={buttonClicked}
                variant={bidSuit === null ? 'outline' : 'solid'}
                isFullWidth
                isDisabled={bidSuit === null}
                onClick={async () => {
                  setButtonClicked(true);
                  setTimeout(() => setButtonClicked(false), 2000);

                  if (
                    authUser.displayName &&
                    bidValue !== null &&
                    bidSuit !== null
                  ) {
                    await firebase.setBid(id, authUser.displayName, {
                      value: bidValue,
                      suit: bidSuit,
                    });
                    setBidSuit(null);
                  }
                }}
              >
                BID
              </Button>
            </ButtonGroup>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default BidChat;
