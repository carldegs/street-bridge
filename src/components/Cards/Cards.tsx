/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useRef, useEffect } from 'react';
import cx from 'classnames';

import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Card, CardSuit, BidSuit } from '../../models';

import CardComponent from '../CardComponent/CardComponent';

import SBButton from '../SBButton/SBButton';

import styles from './Cards.module.scss';

interface ICards {
  cards: Card[];
  roundSuit?: BidSuit;
  isFirstPlayer?: boolean;
  disabled?: boolean;
  onClick?: (card: Card) => void;
  isSpectating?: boolean;
  players?: string[];
  onSpectatedPlayerClick?: (player: string) => void;
  spectatedPlayer?: string;
  onAutoSpectateClick?: () => void;
  autoSpectate?: boolean;
}

const checkIfCardPlayable = (
  cards: Card[],
  card: Card,
  isFirstPlayer: boolean,
  roundSuit: BidSuit,
  disabled = false
): boolean => {
  if (disabled) {
    return false;
  }

  if (isFirstPlayer) {
    return true;
  }

  if (
    cards.some(c => c.suit === ((roundSuit as unknown) as CardSuit)) &&
    card.suit !== ((roundSuit as unknown) as CardSuit)
  ) {
    return false;
  }

  return true;
};

const Cards: React.FC<ICards> = ({
  cards,
  disabled,
  onClick,
  roundSuit = BidSuit.noTrump,
  isFirstPlayer = false,
  isSpectating = false,
  players = [],
  onSpectatedPlayerClick,
  spectatedPlayer = '',
  onAutoSpectateClick,
  autoSpectate = false,
}: ICards) => {
  const [tempDisable, setTempDisable] = useState(false);
  const ref = useRef((0 as unknown) as ReturnType<typeof setTimeout>);
  const finalCards = cards.filter(card => card.turnUsed === -1);

  useEffect(() => {
    return () => {
      clearTimeout(ref.current);
    };
  }, []);

  return (
    <>
      {isSpectating && (
        <Row
          style={{
            width: '100%',
            margin: 0,
            justifyContent: 'center',
            height: '50px',
            alignItems: 'center',
          }}
          className="mt-2"
        >
          <div>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-autoSpectate">
                  <strong>Auto-spectate</strong>
                  <br />
                  Automatically show current player&apos;s cards
                </Tooltip>
              }
            >
              <span className="mt-3 mx-2">
                <SBButton
                  outline={!autoSpectate}
                  color="green"
                  onClick={() => {
                    if (onAutoSpectateClick) {
                      onAutoSpectateClick();
                    }
                  }}
                >
                  <FontAwesomeIcon icon="robot" />
                </SBButton>
              </span>
            </OverlayTrigger>
            {players.map(player => (
              <SBButton
                outline={player !== spectatedPlayer}
                color="cyan"
                className="mt-3 mx-2"
                key={`playerSelect-${player}`}
                onClick={() => {
                  if (onSpectatedPlayerClick) {
                    onSpectatedPlayerClick(player);
                  }
                }}
              >
                {player}
              </SBButton>
            ))}
          </div>
        </Row>
      )}
      <Row style={{ width: '100%', margin: 0, justifyContent: 'center' }}>
        <Col
          className={cx(styles.cards, {
            [styles.disabled]: !!disabled,
          })}
          style={{
            maxWidth: `${68 * (finalCards.length + 0.5)}px`,
            marginTop: isSpectating ? 0 : 24,
          }}
        >
          {finalCards.map((card, i) => {
            const isDisabled = !checkIfCardPlayable(
              finalCards,
              card,
              isFirstPlayer,
              roundSuit,
              disabled
            );
            return (
              <CardComponent
                key={`${card.value}${card.suit}`}
                card={card}
                style={{ zIndex: i }}
                disabled={isDisabled || tempDisable}
                onClick={() => {
                  if (!isDisabled && !!onClick && !tempDisable) {
                    onClick(card);

                    if (!isSpectating) {
                      setTempDisable(true);
                      ref.current = setTimeout(() => {
                        setTempDisable(false);
                      }, 2000);
                    }
                  }
                }}
                className={styles.card}
              />
            );
          })}
        </Col>
      </Row>
    </>
  );
};

export default Cards;
