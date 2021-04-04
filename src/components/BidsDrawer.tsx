import {
  DrawerProps,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  Flex,
  Stack,
} from '@chakra-ui/react';
import React from 'react';

import useRoomBid from '../hooks/useRoomBid';
import { Abort } from '../types/Abort';
import { toBidsArray } from '../utils/bids';

import { ChatBubble } from './BidChat';
import CurrentBidStat from './CurrentBidStat';
import ScoresToWinStat from './ScoresToWinStat';

const BidsDrawer: React.FC<Abort<DrawerProps>> = ({
  isOpen,
  onClose,
}: Abort<DrawerProps>) => {
  const { game } = useRoomBid();
  const { bids, playerInfo } = game || {};

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Bids</DrawerHeader>
        <Flex justifyContent="space-evenly" mb={8}>
          <CurrentBidStat />
          <ScoresToWinStat />
        </Flex>
        <Flex justifyContent="space-around">
          <Stack spacing={4}>
            {bids &&
              toBidsArray(bids).map(bid => (
                <ChatBubble
                  key={`${bid.username}-${bid.suit}-${bid.value}`}
                  bid={bid}
                  playerInfo={playerInfo}
                  displayName=""
                />
              ))}
          </Stack>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
};

export default BidsDrawer;
