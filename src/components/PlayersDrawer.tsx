import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  Flex,
  Heading,
  HStack,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import useRoomLobbyData from '../hooks/useRoomLobbyData';
import { Abort } from '../types/Abort';

const PlayersDrawer: React.FC<Abort<DrawerProps>> = ({
  isOpen,
  onClose,
}: Abort<DrawerProps>) => {
  const { groupedMembers } = useRoomLobbyData();

  return (
    <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Players</DrawerHeader>
        <DrawerBody>
          {groupedMembers.map(({ name, players: playerList, color }) =>
            playerList.length ? (
              <Flex
                flexDir="column"
                bg={`${color}.500`}
                borderRadius={16}
                p={6}
                mb={6}
                key={name}
              >
                <Heading size="md" mb={6}>
                  {name}
                </Heading>
                <Stack spacing={4}>
                  {playerList.map(({ username, isHost }) => (
                    <HStack key={username}>
                      <Text size="lg">{username}</Text>
                      {isHost && (
                        <Tag colorScheme={color} title="Host">
                          <FontAwesomeIcon icon="crown" />
                        </Tag>
                      )}
                    </HStack>
                  ))}
                </Stack>
              </Flex>
            ) : null
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayersDrawer;
