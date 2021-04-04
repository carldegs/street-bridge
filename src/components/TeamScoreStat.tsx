import React from 'react';

import useRoomGameplay from '../hooks/useRoomGameplay';

import GameStat from './GameStat';

interface TeamScoreStatProps {
  team: number;
}

const teamColors = ['green', 'orange'];

const TeamScoreStat: React.FC<TeamScoreStatProps> = ({
  team,
}: TeamScoreStatProps) => {
  const { teamNames, scoresToWin, score } = useRoomGameplay();

  if (!teamNames?.length || !scoresToWin?.length || !score?.length) {
    return null;
  }

  return (
    <GameStat
      label={teamNames[team]}
      helpText={`${scoresToWin[team]} to win`}
      value={`${score[team]}`}
      color={`${teamColors[team]}.300`}
    />
  );
};

export default TeamScoreStat;
