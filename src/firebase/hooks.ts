import { useRef, useEffect, useContext, useState } from 'react';

import { store, GameState } from '../store/store';

import { Game, Phase } from '../models';

import FirebaseContext from './useFirebase';

export const xyagadgea = 'x';

export const useGames = (): GameState[] => {
  const obs = useRef({} as () => void);
  const firebase = useContext(FirebaseContext);
  const { state, dispatch } = useContext(store);
  // TODO: displayName instead
  const [games, setGames] = useState<GameState[]>([]);
  const { displayName } = state.authUser;

  useEffect(() => {
    obs.current = firebase.games.onSnapshot(snapshot => {
      const gamesList = snapshot.docs.map(s => {
        const data = s.data() as Game;

        return {
          name: data.name || s.id,
          id: s.id,
          userJoined: data.players.some(player => player === displayName),
          numPlayers: data.players.length,
        } as GameState;
      });

      setGames(gamesList);
    });

    return () => {
      obs.current();
    };
  }, [firebase, dispatch, displayName]);

  return games;
};

export const useGame = (
  gameId: string
): {
  game: Game;
  error: string;
} => {
  const obs = useRef({} as () => void);
  const firebase = useContext(FirebaseContext);
  const [game, setGame] = useState<Game>({
    players: [],
    playerInfo: {},
    name: '',
    phase: Phase.lobby,
    winBid: null,
    winTeam: null,
    currPlayer: 0,
    score: [0, 0],
    bids: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    obs.current = firebase.games.doc(gameId).onSnapshot(snapshot => {
      const data = snapshot.data();

      if (data) {
        setGame(data as Game);
        setError('');
      } else {
        setError('no-game');
      }
    });

    return () => {
      obs.current();
    };
  }, [gameId, firebase]);

  return { game, error };
};
