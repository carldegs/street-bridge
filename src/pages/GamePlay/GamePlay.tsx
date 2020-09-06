import React, { useMemo } from 'react';
import cx from 'classnames';
import { useParams } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { sortBy } from 'lodash';

import { useGame } from '../../firebase/hooks';
import { useFirebase } from '../../firebase/useFirebase';
import { useAuth } from '../../store/useAuth';
import Cards from '../../components/Cards/Cards';
import { Card, Round, BidSuit } from '../../models';
import CardComponent from '../../components/CardComponent/CardComponent';
import { getScoreToWin } from '../../utils/bids';

import styles from './GamePlay.module.scss';

const GamePlay: React.FC = () => {
  const { id } = useParams();
  const { game } = useGame(id);
  const firebase = useFirebase();
  const auth = useAuth();
  const authUser = auth.state.authUser || { displayName: '' };

  const playersTable = useMemo(() => {
    if (game.players?.length === 4 && authUser.displayName) {
      const authUserPosition = game.players.indexOf(authUser.displayName);

      const leftPlayer = game.players[(authUserPosition + 1) % 4];
      const topPlayer = game.players[(authUserPosition + 2) % 4];
      const rightPlayer = game.players[(authUserPosition + 3) % 4];

      const { team } = game.playerInfo[authUser.displayName];
      const teamColor = team === 0 ? 'Red' : 'Blue';
      const enemyColor = team === 0 ? 'Blue' : 'Red';
      const currPlayer = game.players[game.currPlayer];
      const currPlayerColor =
        game.playerInfo[currPlayer].team === 0 ? 'Red' : 'Blue';

      const currRoundNum = game?.currRound || 0;
      const currRound: Round | null = game?.rounds
        ? game.rounds[currRoundNum]
        : null;
      const bidWinner = game?.winTeam;
      const scoresToWin =
        game?.winBid?.value && bidWinner !== undefined
          ? [
              getScoreToWin(bidWinner === 0, game.winBid.value),
              getScoreToWin(bidWinner === 1, game.winBid.value),
            ]
          : undefined;

      let roundSuit = BidSuit.noTrump;
      if (typeof currRoundNum === 'number') {
        const prevRoundNum = currRoundNum - 1;
        const firstTurnPlayer =
          currRoundNum > 0
            ? game.rounds[prevRoundNum].winningPlayer || undefined
            : game.winPlayer || undefined;

        if (firstTurnPlayer && currRound) {
          const firstPlayerRound = currRound[firstTurnPlayer] as Card;

          if (firstPlayerRound) {
            roundSuit = (firstPlayerRound.suit as unknown) as BidSuit;
          }
        }
      }

      let roundWinner;
      if (currRound && currRound?.winningPlayer) {
        if (currRound?.winningTeam === 0) {
          roundWinner = 'Red';
        } else if (currRound?.winningTeam === 1) {
          roundWinner = 'Blue';
        }
      }

      return {
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
        teamColor,
        enemyColor,
        currPlayer,
        currPlayerColor,
        currPlayerCard: currRound
          ? (currRound[authUser.displayName] as Card)
          : undefined,
        isFirstPlayer: !(currRound && currRound[rightPlayer]),
        roundSuit,
        scoresToWin,
        roundWinner,
      };
    }

    return {
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
      currPlayerColor: 'Red',
      isFirstPlayer: false,
      roundSuit: BidSuit.noTrump,
      scoresToWin: undefined,
      roundWinner: undefined,
    };
  }, [game, authUser]);

  const cards: Card[] = useMemo(() => {
    if (authUser.displayName) {
      const unsortedCards = game?.playerInfo[authUser.displayName]?.cards || [];
      return sortBy(unsortedCards, ['suit', 'value']);
    }
    return [];
  }, [game, authUser]);

  return (
    <div className={styles.GamePlay}>
      <Row style={{ width: '100%' }}>
        <Col
          sm={2}
          className="d-flex flex-column align-items-center justify-content-center"
        >
          <div className={cx(styles.redScore)}>
            {game?.score?.length ? game.score[0] : 0}
            <div className={styles.subtitle}>
              {playersTable.scoresToWin
                ? `${playersTable.scoresToWin[0]} to win`
                : 'N/A'}
            </div>
          </div>
        </Col>
        <Col>
          <div className={styles.row1}>
            <div
              className={cx(styles.topPlayer, {
                [styles[`text${playersTable.teamColor}`]]:
                  playersTable.top.isCurrPlayer,
              })}
            >
              {playersTable.top.username}
            </div>
          </div>
          <div className={styles.row2}>
            <div
              className={cx(styles.leftPlayer, {
                [styles[`text${playersTable.enemyColor}`]]:
                  playersTable.left.isCurrPlayer,
              })}
            >
              {playersTable.left.username}
            </div>
            <div
              className={cx(
                styles.table,
                styles[`border${playersTable.currPlayerColor}`],
                {
                  [styles[`topBox${playersTable.teamColor}`]]:
                    playersTable.top.isCurrPlayer,
                  [styles[`leftBox${playersTable.enemyColor}`]]:
                    playersTable.left.isCurrPlayer,
                  [styles[`rightBox${playersTable.enemyColor}`]]:
                    playersTable.right.isCurrPlayer,
                  [styles[`bottomBox${playersTable.teamColor}`]]:
                    playersTable.currPlayer === authUser.displayName,
                  [styles[
                    `win${playersTable.roundWinner}`
                  ]]: !!playersTable.roundWinner,
                }
              )}
            >
              <Row className="w-100" style={{ height: '140px' }}>
                <Col className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.top.card}
                    className={styles.tableCardTop}
                  />
                </Col>
              </Row>
              <Row className="w-100" style={{ height: '140px' }}>
                <Col xs={6} className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.left.card}
                    className={styles.tableCardLeft}
                  />
                </Col>
                <Col xs={6} className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.right.card}
                    className={styles.tableCardRight}
                  />
                </Col>
              </Row>
              <Row className="w-100" style={{ height: '140px' }}>
                <Col className="d-flex justify-content-center">
                  <CardComponent
                    card={playersTable.currPlayerCard}
                    className={styles.tableCardBottom}
                  />
                </Col>
              </Row>
            </div>
            <div
              className={cx(styles.rightPlayer, {
                [styles[`text${playersTable.enemyColor}`]]:
                  playersTable.right.isCurrPlayer,
              })}
            >
              {playersTable.right.username}
            </div>
          </div>
          <div className={styles.row3}>
            <div
              className={cx(styles.bottomPlayer, {
                [styles[`text${playersTable.teamColor}`]]:
                  playersTable.currPlayer === authUser.displayName,
              })}
            >
              {authUser.displayName}
            </div>
          </div>
        </Col>
        <Col
          sm={2}
          className="d-flex flex-column align-items-center justify-content-center"
        >
          <div className={cx(styles.blueScore)}>
            {game?.score?.length ? game.score[1] : 0}
            <div className={styles.subtitle}>
              {playersTable.scoresToWin
                ? `${playersTable.scoresToWin[1]} to win`
                : 'N/A'}
            </div>
          </div>
        </Col>
      </Row>
      <Cards
        cards={cards}
        disabled={
          playersTable.currPlayer !== authUser.displayName ||
          !!playersTable.currPlayerCard
        }
        onClick={card => {
          if (authUser.displayName) {
            firebase.playCard(id, authUser.displayName, card);
          }
        }}
        isFirstPlayer={playersTable.isFirstPlayer}
        roundSuit={playersTable.roundSuit}
      />
    </div>
  );
};

export default GamePlay;
