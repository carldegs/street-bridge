import React from 'react';

import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  useDisclosure,
  useBreakpointValue,
  Box,
  Flex,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react';

import { useFirebase } from '../firebase/useFirebase';
import { useAuth } from '../store/useAuth';

import SmallLogo from './SmallLogo';

import DeleteAccountModal from './DeleteAccountModal';
import ResetPasswordModal from './ResetPasswordModal';

interface ISBNavbar {
  children: any;
  title?: string;
}

const SBNavbar: React.FC<ISBNavbar> = ({ title, children }: ISBNavbar) => {
  const firebase = useFirebase();
  const auth = useAuth();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const resetPasswordDisc = useDisclosure();
  const deleteAccountDisc = useDisclosure();

  return (
    <Box>
      <DeleteAccountModal
        isOpen={deleteAccountDisc.isOpen}
        onClose={deleteAccountDisc.onClose}
      />
      <ResetPasswordModal
        isOpen={resetPasswordDisc.isOpen}
        onClose={resetPasswordDisc.onClose}
      />
      <Flex px={8} h="60px" alignItems="center" mt={2} mb={4}>
        <SmallLogo />
        {!isMobile && (
          <>
            <Spacer />
            <Text color="white" fontWeight="bold" fontSize="2xl" opacity={0.6}>
              {title}
            </Text>
          </>
        )}
        <Spacer />
        <Menu>
          <MenuButton>
            <HStack spacing={2}>
              <Avatar
                size={isMobile ? 'md' : 'sm'}
                name={auth.state?.authUser?.displayName || undefined}
              />
              {!isMobile && (
                <Text color="white">{auth.state?.authUser?.displayName}</Text>
              )}
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={() => {
                firebase.logoutUser();
                auth.logout();
              }}
            >
              Logout
            </MenuItem>
            <MenuDivider />
            <MenuGroup title="Settings">
              <MenuItem onClick={deleteAccountDisc.onOpen}>
                Delete Account
              </MenuItem>

              <MenuItem isDisabled onClick={resetPasswordDisc.onOpen}>
                Reset Password
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>

      <Box>{children}</Box>
    </Box>
  );
};

export default SBNavbar;
