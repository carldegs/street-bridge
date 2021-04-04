import {
  HeadingProps,
  Flex,
  Spacer,
  Heading,
  Tag,
  Stack,
  SimpleGrid,
  GridItem,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import useRoomGameplay, {
  PlayerTableDetail,
  PlayerTablePosition,
} from '../hooks/useRoomGameplay';
import theme from '../theme';

import CardComponent from './CardComponent';

interface PlayerNameProps extends HeadingProps {
  player: PlayerTableDetail;
  isSide?: boolean;
}

const PlayerName: React.FC<PlayerNameProps> = ({
  player,
  isSide,
  ...props
}: PlayerNameProps) => (
  <Flex flexDir={isSide ? 'column-reverse' : 'row'}>
    <Spacer />
    <Heading
      fontSize="2xl"
      textAlign="center"
      color={player.isCurrPlayer ? `${player.color}.500` : 'purple.700'}
      {...props}
    >
      {player.username}
    </Heading>
    {player.isHost && (
      <Tag
        ml={!isSide ? 2 : 'inherit'}
        mb={isSide ? 4 : 'inherit'}
        colorScheme={player.color}
        title="Host"
        transform={isSide ? 'rotate(-90deg)' : 'inherit'}
      >
        <FontAwesomeIcon icon="crown" />
      </Tag>
    )}
    <Spacer />
  </Flex>
);

const GameTable: React.FC = () => {
  const {
    table,
    roundWinner,
    currPlayerPos,
    currPlayerColor,
  } = useRoomGameplay();
  const { bottom, top, left, right } = table;

  let boxShadow: string;
  const boxShadowColor =
    theme.colors[currPlayerColor as 'orange' | 'green'][500];
  const activeBorder = `solid 3px ${boxShadowColor}`;
  switch ((currPlayerPos as unknown) as PlayerTablePosition) {
    case PlayerTablePosition.top:
      boxShadow = `inset 0 14px 18px -14px ${boxShadowColor}`;
      break;
    case PlayerTablePosition.left:
      boxShadow = `inset 28px 0 36px -28px ${boxShadowColor}`;
      break;
    case PlayerTablePosition.right:
      boxShadow = `inset -14px 0 18px -14px ${boxShadowColor}`;
      break;
    case PlayerTablePosition.bottom:
      boxShadow = `inset 0 -14px 18px -14px ${boxShadowColor}`;
      break;
    default:
      boxShadow = '0';
      break;
  }

  const tableProps = {
    border: 0,
    boxShadow,
    [`border${['Bottom', 'Left', 'Top', 'Right'].find(
      (pos, i) => i === currPlayerPos
    )}`]: activeBorder,
  };

  return (
    <Stack>
      <PlayerName player={top} />
      <Flex justifyContent="center">
        <PlayerName
          player={left}
          sx={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
          isSide
        />
        <SimpleGrid
          w={['full', '500px']}
          h={['300px', '500px']}
          mx={4}
          my={2}
          bg={roundWinner ? `${roundWinner}.500` : 'purple.900'}
          borderRadius={64}
          transition="box-shadow 0.1s, border 0.1s, background-color 0.1s"
          columns={3}
          p={6}
          gridAutoRows="1fr"
          gridAutoColumns="1fr"
          {...tableProps}
        >
          <GridItem />
          <GridItem display="flex" justifyContent="center" alignItems="center">
            <CardComponent card={top.card} />
          </GridItem>
          <GridItem />

          <GridItem display="flex" justifyContent="center" alignItems="center">
            <CardComponent card={left.card} />
          </GridItem>
          <GridItem />
          <GridItem display="flex" justifyContent="center" alignItems="center">
            <CardComponent card={right.card} />
          </GridItem>

          <GridItem />
          <GridItem display="flex" justifyContent="center" alignItems="center">
            <CardComponent card={bottom.card} />
          </GridItem>
          <GridItem />
        </SimpleGrid>
        <PlayerName player={right} sx={{ writingMode: 'vertical-lr' }} isSide />
      </Flex>
      <PlayerName player={bottom} />
    </Stack>
  );
};

export default GameTable;
