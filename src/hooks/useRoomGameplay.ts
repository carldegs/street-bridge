/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prefer-destructuring */
import { useMemo } from 'react';
import { useParams } from 'react-router';

import { useGame } from '../firebase/hooks';
import { BidSuit, Card, DefaultParams, Round } from '../models';
import { useAuth } from '../store/useAuth';
import { getScoreToWin } from '../utils/bids';

const teamColors = ['green', 'orange'];

export enum PlayerTablePosition {
  bottom = 0,
  left,
  top,
  right,
}

export class PlayerTableDetail {
  public isCurrPlayer: boolean;

  public isHost: boolean;

  public card?: Card;

  constructor(
    public username: string,
    public color: 'green' | 'orange',
    currPlayer?: string,
    host?: string,
    currRound?: Round | null
  ) {
    this.isCurrPlayer = username === currPlayer;
    this.isHost = username === host;
    if (currRound) {
      this.card = currRound[username] as Card;
    }
  }
}

// TODO: Combine to a Game/Room class with other
const useRoomGameplay = () => {
  const { id } = useParams<DefaultParams>();
  const { game, error: gameError } = useGame(id);
  const auth = useAuth();
  const {
    players,
    host,
    teamNames = ['', ''],
    playerInfo,
    rounds,
    currRound: currRoundNum,
    currPlayer,
    winBid,
    winTeam,
    score,
    winPlayer,
  } = game;

  const displayName = useMemo(() => auth.state.authUser?.displayName || '', [
    auth,
  ]);

  if (players?.length !== 4 || !displayName) {
    return {
      table: {
        top: new PlayerTableDetail('', 'green'),
        right: new PlayerTableDetail('', 'orange'),
        left: new PlayerTableDetail('', 'green'),
        bottom: new PlayerTableDetail('', 'orange'),
      },
      currPlayerColor: 'orange',
      isFirstPlayer: false,
      roundSuit: BidSuit.noTrump,
      isHost: false,
      bidColor: 'orange',
      isSpectator: false,
    };
  }

  let authUserPosition = players.indexOf(displayName);
  const isSpectator = authUserPosition === -1;

  if (isSpectator) {
    authUserPosition = 0;
  }

  const sortedPlayers = [0, 1, 2, 3].map(
    i => players[(authUserPosition + i) % 4]
  );

  const { team: authUserTeam } =
    playerInfo[sortedPlayers[PlayerTablePosition.bottom]] || {};
  const teamColor = teamColors[authUserTeam];
  const enemyColor = teamColors[Math.abs(authUserTeam - 1)];

  const currPlayerInfo = playerInfo[players[currPlayer]];
  const currPlayerColor = teamColors[currPlayerInfo.team];

  const currRound: Round | null = rounds ? rounds[currRoundNum] : null;
  const scoresToWin =
    winBid?.value && winTeam !== undefined
      ? [
          getScoreToWin(winTeam === 0, winBid.value),
          getScoreToWin(winTeam === 1, winBid.value),
        ]
      : undefined;
  const bidColor = teamColor[winTeam || 0];

  let gameWinner: number;
  if (score?.length && scoresToWin) {
    if (score[0] >= scoresToWin[0]) {
      gameWinner = 0;
    } else if (score[1] >= scoresToWin[1]) {
      gameWinner = 1;
    }
  }

  let roundSuit = BidSuit.noTrump;
  if (typeof currRoundNum === 'number') {
    const prevRoundNum = currRoundNum - 1;
    const firstTurnPlayer =
      currRoundNum > 0
        ? rounds[prevRoundNum].winningPlayer || undefined
        : players[(players.indexOf(winPlayer as string) + 1) % 4] || undefined;

    if (firstTurnPlayer && currRound) {
      const firstPlayerRound = currRound[firstTurnPlayer] as Card;

      if (firstPlayerRound) {
        roundSuit = (firstPlayerRound.suit as unknown) as BidSuit;
      }
    }
  }

  let roundWinner: string | undefined;
  if (currRound && currRound?.winningPlayer) {
    if (currRound?.winningTeam === 0) {
      roundWinner = teamColors[0];
    } else if (currRound?.winningTeam === 1) {
      roundWinner = teamColors[1];
    }
  }

  const isHost = displayName === host;

  type TableDetails = Record<
    'bottom' | 'left' | 'top' | 'right',
    PlayerTableDetail
  >;

  let table: TableDetails;

  ['bottom', 'left', 'top', 'right'].forEach((position, i) => {
    table = {
      ...table,
      [position]: new PlayerTableDetail(
        sortedPlayers[i],
        (i % 2 ? enemyColor : teamColor) as 'green' | 'orange',
        players[currPlayer],
        host,
        currRound
      ),
    };
  });

  return {
    table,
    teamColor,
    enemyColor,
    currPlayer,
    currPlayerName: players[currPlayer],
    currPlayerColor,
    currPlayerCard: currRound ? (currRound[displayName] as Card) : undefined,
    isFirstPlayer: !(
      currRound && currRound[sortedPlayers[PlayerTablePosition.right]]
    ),
    currPlayerPos: sortedPlayers.indexOf(players[currPlayer]),
    roundSuit,
    scoresToWin,
    roundWinner,
    isHost,
    currBid: winBid || undefined,
    bidColor,
    gameWinner,
    isSpectator,
    rounds,
    sortedPlayers,
    teamNames,
    score,
    game,
    gameError,
    auth,
  };
};

export default useRoomGameplay;
