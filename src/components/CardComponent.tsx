import React from 'react';
import { Box, Flex, Spacer, Text } from '@chakra-ui/react';

import { Card } from '../models';
import { getCardColor, getCardValue, getSuitString } from '../utils/cards';

import MotionFlex, { MotionFlexProps } from './motion/MotionFlex';

interface CardComponentProps extends Omit<MotionFlexProps, 'onClick'> {
  card?: Card;
  isDisabled?: boolean;
  onClick?: (card: Card) => void;
  disableClick?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isDisabled = false,
  onClick,
  disableClick,
  ...props
}: CardComponentProps) => {
  if (!card) {
    return null;
  }

  const accentColor = isDisabled
    ? 'gray.600'
    : `${getCardColor(card.suit).toLowerCase()}.200`;
  const textProps = {
    fontWeight: 'bold',
    color: accentColor,
  };

  return (
    <Box
      onClick={() => {
        if (!isDisabled && !!onClick && !disableClick) {
          onClick(card);
        }
      }}
      zIndex={1}
    >
      <MotionFlex
        flexDir="column"
        py={1}
        px={2}
        bg={isDisabled ? 'gray.700' : `brand${getCardColor(card.suit)}`}
        borderWidth={6}
        borderStyle="solid"
        borderColor={accentColor}
        borderRadius={12}
        w={['80px', '80px', '100px']}
        h={['112px', '112px', '140px']}
        minW={['80px', '80px', '100px']}
        minH={['112px', '112px', '140px']}
        boxSizing="border-box"
        boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
        cursor="pointer"
        whileHover={{
          scale: 1.2,
          marginLeft: '30px',
          marginRight: '30px',
          marginTop: '-22px',
        }}
        whileTap={
          !isDisabled && !disableClick && !!onClick
            ? {
                rotate: 120,
                y: -200,
                opacity: 0,
              }
            : undefined
        }
        variants={{
          visible: {
            opacity: 1,
            y: 0,
          },
          hidden: {
            opacity: 0,
            y: -100,
          },
        }}
        transform={isDisabled ? 'scale(0.8)' : undefined}
        {...props}
      >
        <Flex>
          <Text fontSize="xl" {...textProps}>
            {getCardValue(card.value)}
          </Text>
          <Spacer />
        </Flex>
        <Spacer />
        <Flex>
          <Spacer />
          <Text
            fontSize="7xl"
            lineHeight="65px"
            marginTop="-12px"
            {...textProps}
          >
            {getSuitString(card.suit)}
          </Text>
          <Spacer />
        </Flex>
        <Spacer />
        <Flex display={['none', 'none', 'none', 'inherit']}>
          <Spacer />
          <Text transform="rotate(180deg)" fontSize="xl" {...textProps}>
            {getCardValue(card.value)}
          </Text>
        </Flex>
      </MotionFlex>
    </Box>
  );
};

export default CardComponent;
