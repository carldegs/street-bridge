/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import cx from 'classnames';

import { Row, Col } from 'react-bootstrap';

import { Round, PlayerInfo, Card } from '../../models';
import CardComponent from '../CardComponent/CardComponent';

import objToArr from '../../utils/array';

import styles from './RoundsSummary.module.scss';

interface IRoundsSummary {
  rounds?: Record<number, Round>;
  players?: Record<string, PlayerInfo>;
}

const RoundsSummary: React.FC<IRoundsSummary> = ({
  rounds,
  players,
}: IRoundsSummary) => {
  const roundsArr = useMemo(() => {
    if (!rounds) {
      return [];
    }

    return objToArr(rounds);
  }, [rounds]);

  const playerNames = useMemo(() => Object.keys(players || {}), [players]);

  return (
    <div className={styles.RoundsSummary}>
      <Row style={{ fontWeight: 'bold' }} className={styles.row}>
        <Col>Players</Col>
        {roundsArr.map((round, i) => (
          <Col className="d-flex justify-content-center" key={i}>
            {i + 1}
          </Col>
        ))}
      </Row>
      {playerNames.map(name => (
        <Row key={name} className={styles.row}>
          <Col
            className={cx(
              'd-flex flex-column justify-content-center',
              styles[
                `text${players && players[name].team === 0 ? 'Red' : 'Blue'}`
              ]
            )}
          >
            {name}
          </Col>
          {roundsArr.map((round, i) => (
            <Col key={`${name}-${i}`} className="d-flex justify-content-center">
              <CardComponent
                card={round[name] as Card}
                disabled={round.winningPlayer !== name}
                small
              />
            </Col>
          ))}
        </Row>
      ))}
    </div>
  );
};

export default RoundsSummary;
