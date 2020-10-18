import { useEffect, useState, useMemo } from 'react';

import { useAuth } from '../../store/useAuth';
import { useGame } from '../../firebase/hooks';
import { Round, BidSuit, Card, Bid } from '../../models';
import { getScoreToWin } from '../../utils/bids';

enum TeamColor {
  Red = 'Red',
  Blue = 'Blue',
}

export class PlayerTableDetail {
  public isCurrPlayer: boolean;

  public isHost: boolean;

  public card?: Card;

  constructor(
    public username: string,
    public color: TeamColor,
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

export interface IGameDetail {
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

const getTeamColor = (team: number): TeamColor =>
  team === 0 ? TeamColor.Red : TeamColor.Blue;

const useGameDetails = (id: string): IGameDetail => {
  const { game } = useGame(id);
  const auth = useAuth();
  const authUser = useMemo(() => auth.state.authUser || { displayName: '' }, [
    auth,
  ]);
  const [gameDetails, setGameDetails] = useState<IGameDetail>({
    top: new PlayerTableDetail('', TeamColor.Red),
    right: new PlayerTableDetail('', TeamColor.Blue),
    left: new PlayerTableDetail('', TeamColor.Blue),
    bottom: new PlayerTableDetail('', TeamColor.Red),
    currPlayerColor: TeamColor.Red,
    isFirstPlayer: false,
    roundSuit: BidSuit.noTrump,
    isHost: false,
    bidColor: TeamColor.Red,
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
      host,
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
          roundWinner = TeamColor.Red;
        } else if (currRound?.winningTeam === 1) {
          roundWinner = TeamColor.Blue;
        }
      }

      const isHost = displayName === host;

      setGameDetails({
        left: new PlayerTableDetail(
          leftPlayer,
          enemyColor,
          currPlayer,
          host,
          currRound
        ),
        top: new PlayerTableDetail(
          topPlayer,
          teamColor,
          currPlayer,
          host,
          currRound
        ),
        right: new PlayerTableDetail(
          rightPlayer,
          enemyColor,
          currPlayer,
          host,
          currRound
        ),
        bottom: new PlayerTableDetail(
          bottomPlayer,
          teamColor,
          currPlayer,
          host,
          currRound
        ),
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
