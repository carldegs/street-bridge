import {
  Button,
  IconButton,
  useDisclosure,
  Tag,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useHistory } from 'react-router';

import ChangeHostModal from '../components/ChangeHostModal';
import RoomDeletedModal from '../components/RoomDeletedModal';
import { useFirebase } from '../firebase/useFirebase';
import useRoomLobbyData from '../hooks/useRoomLobbyData';

const GameLobby: React.FC = () => {
  const history = useHistory();
  const firebase = useFirebase();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const {
    players,
    spectators,
    game,
    gameError,
    isHost: isCurrHost,
    canStartGame,
    id,
    auth,
    authUser,
    groupedMembers,
  } = useRoomLobbyData();

  const changeHostModalDisc = useDisclosure();

  return (
    <Container maxW="container.xl" my={6}>
      <RoomDeletedModal
        isOpen={gameError === 'no-game'}
        onClose={() => undefined}
      />
      <ChangeHostModal
        isOpen={changeHostModalDisc.isOpen}
        onClose={changeHostModalDisc.onClose}
      />
      <Flex>
        <Text fontSize="2xl" fontWeight="bold" fontStyle="italic">{`${
          game?.name || ''
        } Lobby`}</Text>
        <Spacer />
        <ButtonGroup>
          {isCurrHost ? (
            <>
              {isMobile ? (
                <IconButton
                  aria-label="Start Game"
                  icon={<FontAwesomeIcon icon="play" />}
                  variant="outline"
                  colorScheme="green"
                  isDisabled={!canStartGame}
                  onClick={() => firebase.startBidding(id)}
                />
              ) : (
                <Button
                  leftIcon={<FontAwesomeIcon icon="play" />}
                  variant="outline"
                  colorScheme="green"
                  isDisabled={!canStartGame}
                  onClick={() => firebase.startBidding(id)}
                >
                  START GAME
                </Button>
              )}
            </>
          ) : null}
          <Menu>
            <MenuButton>
              <IconButton
                aria-label="Settings"
                icon={<FontAwesomeIcon icon="cog" />}
                variant="outline"
                colorScheme="yellow"
                ml={[1, 4]}
              />
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={() => {
                  auth.setAuthUserGame(null);
                  history.push('/home');
                }}
              >
                Back to Lobby
              </MenuItem>
              <MenuItem
                onClick={() => {
                  firebase.leaveGame(id, authUser?.displayName || '');
                  auth.setAuthUserGame(null);
                  history.push('/home');
                }}
              >
                Leave Game
              </MenuItem>
              <MenuDivider />
              {isCurrHost && (
                <MenuGroup title="Settings">
                  <MenuItem
                    onClick={changeHostModalDisc.onOpen}
                    isDisabled={players.length + spectators.length <= 1}
                  >
                    Change Host
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      firebase.deleteGame(id);
                      auth.setAuthUserGame(null);
                    }}
                  >
                    Delete Game
                  </MenuItem>
                  <MenuItem isDisabled>Hide recap during gameplay</MenuItem>
                  <MenuItem isDisabled>Hide bids during gameplay</MenuItem>
                </MenuGroup>
              )}
            </MenuList>
          </Menu>
        </ButtonGroup>
      </Flex>
      <SimpleGrid mt={6} columns={[1, 1, 2, 3]} columnGap={4} rowGap={4}>
        {groupedMembers.map(
          (
            {
              name,
              players: playerList,
              color,
              showButton,
              buttonText,
              onButtonClick,
            },
            i
          ) => (
            <Flex
              flexDir="column"
              bg={`${color}.500`}
              borderRadius={16}
              p={6}
              minH={[0, 0, '300px', '300px']}
              gridColumn={
                i === 2 ? [1, 1, 2, 1].map(j => `span ${j}`) : 'span 1'
              }
              key={`${name}-${color}`}
            >
              <Heading mb={6}>{name}</Heading>
              <Stack spacing={6} flexGrow={1} mb={6}>
                {playerList.map(({ username, isHost }) => (
                  <HStack key={username}>
                    <Text fontSize="2xl">{username}</Text>
                    {isHost && (
                      <Tag colorScheme={color} title="Host">
                        <FontAwesomeIcon icon="crown" />
                      </Tag>
                    )}
                  </HStack>
                ))}
              </Stack>
              {showButton && (
                <Button colorScheme={color} isFullWidth onClick={onButtonClick}>
                  {buttonText}
                </Button>
              )}
            </Flex>
          )
        )}
      </SimpleGrid>
    </Container>
  );
};

export default GameLobby;
