import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { Card } from '../models';
import { getCardColor, getCardValue, getSuitString } from '../utils/cards';

interface SmallCardProps {
  card?: Card;
  isDisabled?: boolean;
}

const SmallCard: React.FC<SmallCardProps> = ({
  card,
  isDisabled,
}: SmallCardProps) => {
  if (!card) {
    return null;
  }

  const accentColor = isDisabled
    ? 'gray.400'
    : `${getCardColor(card.suit).toLowerCase()}.100`;

  return (
    <Flex
      bg={isDisabled ? 'gray.700' : `brand${getCardColor(card.suit)}`}
      borderWidth={3}
      borderStyle="solid"
      borderColor={accentColor}
      color={accentColor}
      borderRadius={12}
      w="fit-content"
      px={[1, 2]}
      py={[2, 3]}
      minW={['50px', '65px']}
      justifyContent="center"
      alignItems="center"
    >
      <Text fontSize={['md', 'xl']} mr={1}>
        {getCardValue(card.value)}
      </Text>
      <Text fontSize={['lg', '2xl']}>{getSuitString(card.suit)}</Text>
    </Flex>
  );
};

export default SmallCard;
