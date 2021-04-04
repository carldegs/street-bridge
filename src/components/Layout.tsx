/* eslint-disable react/jsx-props-no-spreading */
import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';

const Layout: React.FC<BoxProps> = ({ children, ...props }) => (
  <Box h="100vh" p={4} overflowY="auto" {...props}>
    {children}
  </Box>
);

export default Layout;
