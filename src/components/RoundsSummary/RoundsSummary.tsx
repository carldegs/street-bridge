/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';

import { Table } from 'react-bootstrap';

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
      <Table style={{ color: 'white' }} striped hover responsive borderless>
        <thead>
          <tr style={{ fontWeight: 'bold' }}>
            <th>Players</th>
            {roundsArr.map((round, i) => (
              <th style={{ textAlign: 'center' }} key={i}>
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playerNames.map(name => (
            <tr key={name} style={{ height: '72px' }}>
              <td
                className={
                  styles[
                    `text${
                      players && players[name].team === 0 ? 'Red' : 'Blue'
                    }`
                  ]
                }
                style={{ verticalAlign: 'middle' }}
              >
                {name}
              </td>
              {roundsArr.map((round, i) => (
                <td key={`${name}-${i}`}>
                  <div style={{ margin: 'auto', width: 'fit-content' }}>
                    <CardComponent
                      card={round[name] as Card}
                      disabled={round.winningPlayer !== name}
                      small
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RoundsSummary;
