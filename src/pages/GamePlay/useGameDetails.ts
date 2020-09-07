import { useEffect, useState, useMemo } from 'react';

import { useAuth } from '../../store/useAuth';
import { useGame } from '../../firebase/hooks';
import { Round, BidSuit, Card, Bid } from '../../models';
import { getScoreToWin } from '../../utils/bids';

type TeamColor = 'Red' | 'Blue';

interface PlayerTableDetail {
  username: string;
  color: TeamColor;
  isCurrPlayer: boolean;
  card?: Card;
}

interface IGameDetail {
  left: PlayerTableDetail;
  right: PlayerTableDetail;
  top: PlayerTableDetail;
  bottom: PlayerTableDetail;
  teamColor?: TeamColor;
  enemyColor?: TeamColor;
  currPlayer?: string;
  currPlayerColor?: TeamColor;
  currPlayerCard?: Card;
  isFirstPlayer: boolean;
  roundSuit: BidSuit;
  scoresToWin?: number[];
  roundWinner?: string;
  isHost: boolean;
  currBid?: Bid;
  bidColor: TeamColor;
  gameWinner?: TeamColor;
  isSpectator: boolean;
}

const getTeamColor = (team: number) => (team === 0 ? 'Red' : 'Blue');

const useGameDetails = (id: string): IGameDetail => {
  const { game } = useGame(id);
  const auth = useAuth();
  const authUser = useMemo(() => auth.state.authUser || { displayName: '' }, [
    auth,
  ]);
  const [gameDetails, setGameDetails] = useState<IGameDetail>({
    top: {
      username: '',
      color: 'Red',
      isCurrPlayer: false,
    },
    right: {
      username: '',
      color: 'Blue',
      isCurrPlayer: false,
    },
    left: {
      username: '',
      color: 'Blue',
      isCurrPlayer: false,
    },
    bottom: {
      username: '',
      color: 'Red',
      isCurrPlayer: false,
    },
    currPlayerColor: 'Red',
    isFirstPlayer: false,
    roundSuit: BidSuit.noTrump,
    isHost: false,
    bidColor: 'Red',
    isSpectator: false,
  });

  useEffect(() => {
    const {
      players,
      playerInfo,
      currRound: currRoundNum,
      rounds,
      winTeam,
      winBid,
      winPlayer,
      score,
    } = game || {};
    const { displayName } = authUser;

    if (players?.length === 4 && displayName) {
      let authUserPosition = players.indexOf(displayName);
      const isSpectator = authUserPosition === -1;

      if (isSpectator) {
        authUserPosition = 0;
      }

      const bottomPlayer = players[authUserPosition % 4];
      const leftPlayer = players[(authUserPosition + 1) % 4];
      const topPlayer = players[(authUserPosition + 2) % 4];
      const rightPlayer = players[(authUserPosition + 3) % 4];

      const { team } = playerInfo[bottomPlayer] || {};
      const teamColor = getTeamColor(team);
      const enemyColor = getTeamColor(team === 0 ? 1 : 0);

      const currPlayer = players[game.currPlayer];
      const currPlayerColor = getTeamColor(playerInfo[currPlayer].team);

      const currRound: Round | null = rounds ? rounds[currRoundNum] : null;
      const scoresToWin =
        winBid?.value && winTeam !== undefined
          ? [
              getScoreToWin(winTeam === 0, winBid.value),
              getScoreToWin(winTeam === 1, winBid.value),
            ]
          : undefined;
      const bidColor = getTeamColor(winTeam || 0);

      let gameWinner;
      if (score?.length && scoresToWin) {
        if (score[0] >= scoresToWin[0]) {
          gameWinner = 'Red';
        } else if (score[1] >= scoresToWin[1]) {
          gameWinner = 'Blue';
        }
      }

      let roundSuit = BidSuit.noTrump;
      if (typeof currRoundNum === 'number') {
        const prevRoundNum = currRoundNum - 1;
        const firstTurnPlayer =
          currRoundNum > 0
            ? rounds[prevRoundNum].winningPlayer || undefined
            : players[(players.indexOf(winPlayer as string) + 1) % 4] ||
              undefined;

        if (firstTurnPlayer && currRound) {
          const firstPlayerRound = currRound[firstTurnPlayer] as Card;

          if (firstPlayerRound) {
            roundSuit = (firstPlayerRound.suit as unknown) as BidSuit;
          }
        }
      }

      let roundWinner: TeamColor | undefined;
      if (currRound && currRound?.winningPlayer) {
        if (currRound?.winningTeam === 0) {
          roundWinner = 'Red';
        } else if (currRound?.winningTeam === 1) {
          roundWinner = 'Blue';
        }
      }

      const isHost = !!(
        playerInfo &&
        displayName &&
        playerInfo[displayName]?.isHost
      );

      setGameDetails({
        left: {
          username: leftPlayer,
          color: enemyColor,
          isCurrPlayer: leftPlayer === currPlayer,
          card: currRound ? (currRound[leftPlayer] as Card) : undefined,
        },
        top: {
          username: topPlayer,
          color: teamColor,
          isCurrPlayer: topPlayer === currPlayer,
          card: currRound ? (currRound[topPlayer] as Card) : undefined,
        },
        right: {
          username: rightPlayer,
          color: enemyColor,
          isCurrPlayer: rightPlayer === currPlayer,
          card: currRound ? (currRound[rightPlayer] as Card) : undefined,
        },
        bottom: {
          username: bottomPlayer,
          color: teamColor,
          isCurrPlayer: bottomPlayer === currPlayer,
          card: currRound ? (currRound[bottomPlayer] as Card) : undefined,
        },
        teamColor,
        enemyColor,
        currPlayer,
        currPlayerColor,
        currPlayerCard: currRound
          ? (currRound[displayName] as Card)
          : undefined,
        isFirstPlayer: !(currRound && currRound[rightPlayer]),
        roundSuit,
        scoresToWin,
        roundWinner,
        isHost,
        currBid: winBid || undefined,
        bidColor,
        gameWinner: gameWinner ? (gameWinner as TeamColor) : undefined,
        isSpectator,
      });
    }
  }, [game, authUser]);

  return gameDetails;
};

export default useGameDetails;
