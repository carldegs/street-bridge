import {
  Container,
  Flex,
  Heading,
  Button,
  Spacer,
  useDisclosure,
  SimpleGrid,
  Box,
  Text,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory } from 'react-router';

import CreateRoomDrawer from '../components/CreateRoomDrawer';
import FirstLoginDrawer from '../components/FirstLoginDrawer';
import { useGames } from '../firebase/hooks';
import { useFirebase } from '../firebase/useFirebase';
import { useAuth } from '../store/useAuth';

const Home: React.FC = () => {
  const games = useGames();

  const history = useHistory();
  const firebase = useFirebase();
  const auth = useAuth();
  const username = auth.state.authUser?.displayName || '';
  const createRoomDrawerDisc = useDisclosure();

  return (
    <Container maxW="container.xl" centerContent>
      <FirstLoginDrawer />
      <CreateRoomDrawer
        isOpen={createRoomDrawerDisc.isOpen}
        onClose={createRoomDrawerDisc.onClose}
      />
      <Flex w="100%">
        <Heading>Rooms</Heading>
        <Spacer />
        <Button
          aria-label="add room"
          leftIcon={<FontAwesomeIcon icon="plus" />}
          variant="outline"
          colorScheme="cyan"
          onClick={createRoomDrawerDisc.onOpen}
        >
          CREATE ROOM
        </Button>
      </Flex>
      <SimpleGrid w="100%" mt={6} columns={[1, 1, 2, 3]} spacing={6}>
        {!games.length && (
          <Heading
            textAlign="center"
            fontSize="lg"
            color="red.500"
            gridColumn={[1, 1, 2, 3].map(i => `span ${i}`)}
            py={6}
          >
            No rooms found. Create one now!
          </Heading>
        )}
        {games.map(game => (
          <Box background="gray.700" borderRadius={12} key={game.id}>
            <Flex
              p={6}
              background={game.numPlayers < 4 ? 'cyan.700' : 'purple.700'}
              borderTopRadius={12}
              height="calc(100% - 72px)"
              flexDir="column"
            >
              <Text fontSize="2xl" fontStyle="italic">
                {game.name}
              </Text>
              <Spacer />
              <Flex mt={2} alignItems="center">
                <FontAwesomeIcon icon="user-friends" />
                <Text ml={2}>{`${game.numPlayers}/4`}</Text>
                <Spacer />

                <FontAwesomeIcon icon="fingerprint" />
                <Text ml={2}>{`${game.id}/4`}</Text>
              </Flex>
            </Flex>
            <Flex px={6} py={4}>
              <Spacer />
              <Button
                onClick={() => {
                  history.push(`/game/lobby/${game.id}`);
                  if (game.numPlayers === 4) {
                    firebase.spectateGame(game.id, username);
                  }
                }}
                colorScheme={game.numPlayers < 4 ? 'cyan' : 'purple'}
              >
                {game.numPlayers < 4 ? 'JOIN' : 'SPECTATE'}
              </Button>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default Home;
