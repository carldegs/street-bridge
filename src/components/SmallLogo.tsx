import { Box, Heading } from '@chakra-ui/react';
import React from 'react';

interface SmallLogoProps {
  light?: boolean;
}

const SmallLogo: React.FC<SmallLogoProps> = ({ light }: SmallLogoProps) => (
  <Box>
    <Heading
      fontSize="28px"
      fontFamily="IBM Plex Sans"
      fontStyle="italic"
      fontWeight="bold"
      color={light ? 'brandDark.900' : 'brandLight'}
    >
      Street
    </Heading>
    <Heading
      fontSize="34px"
      fontFamily="IBM Plex Serif"
      fontStyle="italic"
      fontWeight="bold"
      color="brandRed"
      mt="-22px"
      ml="16px"
    >
      Bridge
    </Heading>
  </Box>
);

export default SmallLogo;
