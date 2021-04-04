import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  MenuDivider,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import useRoomLobbyData from '../hooks/useRoomLobbyData';
import { Phase } from '../models';

import { BackToLobbyAlertDialog, StopGameAlertDialog } from './AlertDialogs';
import BidsDrawer from './BidsDrawer';
import ChangeHostModal from './ChangeHostModal';
import PlayersDrawer from './PlayersDrawer';
import RecapDrawer from './RecapDrawer';

const GameSettingsMenu: React.FC = () => {
  const { game, isHost, isSpectator } = useRoomLobbyData();
  const { phase } = game;

  const playersDisc = useDisclosure();
  const bidsDisc = useDisclosure();
  const RecapDisc = useDisclosure();
  const backToLobbyDisc = useDisclosure();
  const stopGameDisc = useDisclosure();
  const changeHostDisc = useDisclosure();

  return (
    <>
      <PlayersDrawer
        isOpen={playersDisc.isOpen}
        onClose={playersDisc.onClose}
      />
      <BidsDrawer isOpen={bidsDisc.isOpen} onClose={bidsDisc.onClose} />
      <BackToLobbyAlertDialog
        isOpen={backToLobbyDisc.isOpen}
        onClose={backToLobbyDisc.onClose}
      />
      <StopGameAlertDialog
        isOpen={stopGameDisc.isOpen}
        onClose={stopGameDisc.onClose}
      />
      <ChangeHostModal
        isOpen={changeHostDisc.isOpen}
        onClose={changeHostDisc.onClose}
      />
      <RecapDrawer isOpen={RecapDisc.isOpen} onClose={RecapDisc.onClose} />
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<FontAwesomeIcon icon="cog" size="lg" />}
          position="absolute"
          right={[4, 8]}
          top={16}
        />
        <MenuList>
          <MenuItem onClick={playersDisc.onOpen}>Players</MenuItem>
          {phase === Phase.game && (
            <MenuItem onClick={bidsDisc.onOpen}>Bids</MenuItem>
          )}
          {phase === Phase.game && (
            <MenuItem onClick={RecapDisc.onOpen}>Recap</MenuItem>
          )}

          {(isHost || isSpectator) && <MenuDivider />}

          {isHost && (
            <MenuItem onClick={changeHostDisc.onOpen}>Change Host</MenuItem>
          )}
          {isSpectator && !isHost ? (
            <MenuItem onClick={backToLobbyDisc.onOpen}>Back to Lobby</MenuItem>
          ) : null}
          {isHost && (
            <MenuItem onClick={stopGameDisc.onOpen}>Stop Game</MenuItem>
          )}
        </MenuList>
      </Menu>
    </>
  );
};

export default GameSettingsMenu;
