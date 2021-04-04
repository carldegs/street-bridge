import { useMemo } from 'react';
import { useParams } from 'react-router';

import { useGame } from '../firebase/hooks';
import { useFirebase } from '../firebase/useFirebase';
import { DefaultParams } from '../models';
import { useAuth } from '../store/useAuth';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useRoomLobbyData = () => {
  const { id } = useParams<DefaultParams>();
  const { game, error: gameError } = useGame(id);
  const { players, host, spectators, teamNames = ['', ''] } = game;

  const firebase = useFirebase();
  const auth = useAuth();
  const authUser = auth.state.authUser || { displayName: '' };

  const isSpectator = useMemo(
    () =>
      authUser?.displayName && spectators.some(s => s === authUser.displayName),
    [authUser, spectators]
  );

  const isHost = useMemo(() => authUser.displayName === host, [authUser, host]);

  const currUserGameInfo = useMemo(() => {
    if (game?.playerInfo && authUser?.displayName) {
      return game.playerInfo[authUser.displayName];
    }

    return undefined;
  }, [game, authUser]);

  const [teamAPlayers, teamBPlayers] = useMemo(() => {
    if (game?.playerInfo) {
      let teamA: string[] = [];
      let teamB: string[] = [];

      Object.values(game.playerInfo).forEach(info => {
        if (info.team === 0) {
          teamA = [...teamA, info.username];
        } else {
          teamB = [...teamB, info.username];
        }
      });

      return [teamA.filter(a => !!a), teamB.filter(b => !!b)];
    }

    return [[], []];
  }, [game]);

  const canStartGame = useMemo(
    () => players.length === 4 && teamAPlayers.length === teamBPlayers.length,
    [players, teamAPlayers, teamBPlayers]
  );

  const groupedMembers = useMemo(() => {
    const names = [...teamNames, 'Spectators'];
    const colors = ['green', 'orange', 'purple'];

    return [teamAPlayers, teamBPlayers, spectators].map((group, i) => ({
      name: names[i],
      color: colors[i],
      players: group.map(username => ({
        username,
        isHost: username === host,
      })),
      showButton:
        i === 2
          ? !isSpectator
          : !currUserGameInfo || currUserGameInfo.team !== i,
      buttonText:
        i === 2 ? 'SPECTATE' : `${!currUserGameInfo ? 'JOIN' : 'SWITCH'} TEAM`,
      onButtonClick:
        i === 2
          ? () => {
              if (authUser.displayName) {
                firebase.spectateGame(id, authUser.displayName);
              }
            }
          : () => {
              const authUsername = authUser?.displayName || '';
              const user = !currUserGameInfo
                ? authUsername
                : currUserGameInfo.username;
              firebase.joinGame(id, user, i);
            },
    }));
  }, [
    teamAPlayers,
    teamBPlayers,
    spectators,
    authUser,
    currUserGameInfo,
    firebase,
    host,
    id,
    isSpectator,
    teamNames,
  ]);

  const isAuthUserAPlayer = useMemo(() => {
    return !!(
      game?.playerInfo &&
      authUser?.displayName &&
      game?.playerInfo[authUser.displayName]
    );
  }, [game, authUser]);

  return {
    players,
    host,
    spectators,
    isSpectator,
    currUserGameInfo,
    teamAPlayers,
    teamBPlayers,
    game,
    gameError,
    isHost,
    canStartGame,
    id,
    auth,
    authUser,
    groupedMembers,
    isAuthUserAPlayer,
    teamNames,
  };
};

export default useRoomLobbyData;
