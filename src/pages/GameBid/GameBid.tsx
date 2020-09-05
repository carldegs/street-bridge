/* eslint-disable no-shadow */
import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { useParams, Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { range, sortBy } from 'lodash';

import { useGame } from '../../firebase/hooks';
import { useFirebase } from '../../firebase/useFirebase';
import { getSuitString } from '../../utils/cards';
import { BidSuit, Card } from '../../models';
import SBButton from '../../components/SBButton/SBButton';
import toBidsArray from '../../utils/bids';
import Cards from '../../components/Cards/Cards';
import { useAuth } from '../../store/useAuth';

import styles from './GameBid.module.scss';

// TODO: Make util
const getScore = (isCurrTeam: boolean, bidValue: number): number =>
  isCurrTeam ? 6 + bidValue : 7 - bidValue;

const getColor = (team: number): 'Red' | 'Blue' =>
  team === 0 ? 'Red' : 'Blue';

const GameBid: React.FC = () => {
  const { id } = useParams();
  const { game } = useGame(id);
  const firebase = useFirebase();
  const auth = useAuth();
  const authUser = auth.state.authUser || { displayName: '' };
  const [bidValue, setBidValue] = useState<number | null>(null);
  const [bidSuit, setBidSuit] = useState<BidSuit | null>(null);

  const { currBid, currBidTeam, scoreToWin, currPlayer, bids } = useMemo(() => {
    const currBid = game.winBid;
    const currBidTeam = game.winTeam;
    const currPlayer = game.players[game.currPlayer];
    const scoreToWin =
      currBid && currBid.value
        ? [
            getScore(currBidTeam === 0, currBid.value),
            getScore(currBidTeam === 1, currBid.value),
          ]
        : null;

    return {
      currBid,
      currBidTeam,
      scoreToWin,
      currPlayer,
      bids: game.bids,
    };
  }, [game]);

  const { validBids, validSuits } = useMemo(() => {
    const { value = 1, suit = BidSuit.none } = currBid || {};

    const validBids = range(value === 0 ? 1 : value, 7).filter(
      i => i !== value || (i === value && suit !== BidSuit.noTrump)
    );
    let validSuits: { label: string; value: BidSuit }[] = [];
    if (bidValue === value) {
      validSuits = range(suit, 7)
        .filter(i => i - 2 > suit && i - 2 !== BidSuit.pass)
        .map(i => ({
          label: getSuitString((i - 2) as BidSuit) as string,
          value: i - 2,
        }));
    } else {
      validSuits = range(5).map(i => ({
        label: getSuitString(i) as string,
        value: i,
      }));
    }

    return {
      validBids,
      validSuits,
    };
  }, [currBid, bidValue]);

  const cards: Card[] = useMemo(() => {
    if (authUser.displayName) {
      const unsortedCards = game?.playerInfo[authUser.displayName]?.cards || [];
      return sortBy(unsortedCards, ['suit', 'value']);
    }
    return [];
  }, [game, authUser]);

  const isAuthUserAPlayer = useMemo(() => {
    return !!(
      game?.playerInfo &&
      authUser?.displayName &&
      game?.playerInfo[authUser.displayName]
    );
  }, [game, authUser]);

  const isAuthUserAHost = useMemo(() => {
    return !!(
      game?.playerInfo &&
      authUser?.displayName &&
      game?.playerInfo[authUser.displayName]?.isHost
    );
  }, [game, authUser]);

  useEffect(() => {
    if (bidValue === null || !validBids.some(bid => bid === bidValue)) {
      setBidValue(validBids[0]);
    }
  }, [validBids, bidValue]);

  useEffect(() => {
    if (bidSuit === null || !validSuits.some(suit => suit.value === bidSuit)) {
      setBidSuit(validSuits[0] ? validSuits[0].value : BidSuit.none);
    }
  }, [validSuits, bidSuit]);

  return (
    <div className={styles.GameBid}>
      <Row className={styles.bid}>
        <Col
          sm={2}
          className="d-flex flex-column align-items-center justify-content-center"
        >
          <div
            className={cx(
              styles.bidInfo,
              styles[`text${getColor(currBidTeam || 0)}`]
            )}
          >
            {currBid?.value ? (
              <>
                {currBid.suit !== BidSuit.pass ? currBid.value : ''}
                <span className="font-weight-bold">
                  {getSuitString(currBid.suit)}
                </span>
              </>
            ) : (
              'N/A'
            )}
          </div>
          <div className={styles.subtitle}>Current Bid</div>
        </Col>
        <Col className="d-flex flex-column align-items-center justify-content-center">
          <div className={styles.bidChat}>
            <div className="flex-grow-1 overflow-auto">
              {bids &&
                toBidsArray(bids).map((bid, i) => (
                  <div
                    className={cx(styles.bidBubble, {
                      [styles.currUser]: bid.username === authUser.displayName,
                    })}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${bid.username}-${bid.suit}-${bid.value}-${i}`}
                  >
                    <div className={styles.user}>{bid.username}</div>
                    <div
                      className={cx(
                        styles.bubble,
                        styles[
                          `bg${getColor(
                            game?.playerInfo[bid.username]?.team || 0
                          )}`
                        ]
                      )}
                    >
                      {bid.suit !== BidSuit.pass && bid.value}
                      {getSuitString(bid.suit)}
                    </div>
                  </div>
                ))}
              <div
                className={cx(styles.bidBubble, {
                  [styles.currUser]: currPlayer === authUser.displayName,
                })}
              >
                <div className={styles.user}>{currPlayer}</div>
                <div
                  className={cx(
                    styles.bubble,
                    styles.loadingBubble,
                    styles[
                      `bg${getColor(game?.playerInfo[currPlayer]?.team || 0)}`
                    ]
                  )}
                >
                  <FontAwesomeIcon icon="spinner" pulse />
                </div>
              </div>
            </div>
            {currPlayer === authUser.displayName && (
              <div className={styles.bidSelection}>
                <div className={styles.selectionRow}>
                  {validBids.map(bv => (
                    <div
                      className={cx(styles.item, {
                        [styles.itemSelected]: bv === bidValue,
                      })}
                      key={bv}
                      onClick={() => setBidValue(bv)}
                    >
                      {bv}
                    </div>
                  ))}
                </div>
                <div className={styles.selectionRow}>
                  {validSuits.map(vs => (
                    <div
                      className={cx(styles.item, {
                        [styles.itemSelected]: vs.value === bidSuit,
                        [styles.itemSuit]: vs.value !== BidSuit.noTrump,
                      })}
                      key={vs.value}
                      onClick={() => setBidSuit(vs.value)}
                    >
                      {vs.label}
                    </div>
                  ))}
                </div>
                <div className={styles.actions}>
                  <SBButton
                    outline
                    color="red"
                    onClick={() => {
                      if (authUser.displayName) {
                        firebase.setBid(id, authUser.displayName, {
                          value: 1,
                          suit: BidSuit.pass,
                        });
                      }
                    }}
                  >
                    PASS
                  </SBButton>
                  <SBButton
                    outline
                    color="green"
                    onClick={() => {
                      if (
                        authUser.displayName &&
                        bidValue !== null &&
                        bidSuit !== null
                      ) {
                        firebase.setBid(id, authUser.displayName, {
                          value: bidValue,
                          suit: bidSuit,
                        });
                      }
                    }}
                  >
                    BID
                  </SBButton>
                </div>
              </div>
            )}
          </div>
        </Col>
        <Col
          sm={2}
          className="d-flex flex-column align-items-center justify-content-center"
        >
          <div className={cx(styles.bidInfo)}>
            {scoreToWin ? (
              <div className="d-flex">
                <div className={cx(styles.textRed, 'font-weight-bold')}>
                  {scoreToWin[0]}
                </div>
                {` - `}
                <div className={cx(styles.textBlue, 'font-weight-bold')}>
                  {scoreToWin[1]}
                </div>
              </div>
            ) : (
              'N/A'
            )}
          </div>
          <div className={styles.subtitle}>Score to Win</div>
        </Col>
      </Row>
      <Cards cards={cards} />
      <Row style={{ width: '100%' }}>
        <Col className="d-flex align-items-center mt-3 ml-3">
          {!isAuthUserAPlayer && (
            <Link to="/home">
              <SBButton outline color="cyan">
                BACK TO LOBBY
              </SBButton>
            </Link>
          )}
          {isAuthUserAHost && (
            <SBButton
              outline
              color="red"
              onClick={() => {
                firebase.deleteGame(id);
                auth.setAuthUserGame(null);
              }}
              className="mt-3"
            >
              STOP GAME
            </SBButton>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default GameBid;
