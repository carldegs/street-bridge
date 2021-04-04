import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { useLocation } from 'react-router-dom';

import Layout from '../components/Layout';
import SmallLogo from '../components/SmallLogo';

const Verification: React.FC = () => {
  const { state } = useLocation();
  const { email } = state || {};

  return (
    <Layout display="flex" alignItems="center" justifyContent="center">
      <Box
        background="brandLight"
        p={12}
        borderRadius={20}
        minW={['100%', '100%', '400px']}
        maxW="600px"
        h="fit-content"
      >
        <Stack spacing={6} display="flex" alignItems="center" flexDir="column">
          <SmallLogo light />
          <Box textAlign="center">
            <Heading as="h1">One more step!</Heading>
            <Text fontSize="2xl">
              We have sent an email to
              <b>{` ${email}`}</b>
            </Text>
          </Box>
          <Text fontSize="lg" textAlign="center">
            You need to verify your email to continue. If you not have received
            the verification email, please check your Spam or Bulk Email folder.
          </Text>
        </Stack>
      </Box>
    </Layout>
  );
};
export default Verification;
