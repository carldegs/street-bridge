import React, { ReactElement } from 'react';
import {
  Flex,
  Heading,
  Text,
  TextProps,
  useBreakpointValue,
} from '@chakra-ui/react';

interface GameStatProps extends TextProps {
  label: string;
  value: string | ReactElement;
  helpText?: string | ReactElement;
}

const GameStat: React.FC<GameStatProps> = ({
  label,
  value,
  helpText,
  ...props
}: GameStatProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex flexDir="column" alignItems="center" justifyContent="center">
      <Text as="span" fontSize={isMobile ? '4xl' : '6xl'} {...props}>
        {value}
      </Text>
      <Heading fontSize="md" color="brandDark.700">
        {helpText}
      </Heading>
      <Heading fontSize="lg" color="brandDark.700">
        {label}
      </Heading>
    </Flex>
  );
};

export default GameStat;
