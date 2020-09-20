import { useRef, useEffect, useContext, useState } from 'react';

import { store, GameState } from '../store/store';

import { Game, Phase } from '../models';

import { useAuth } from '../store/useAuth';

import FirebaseContext from './useFirebase';

export const useGames = (): GameState[] => {
  const obs = useRef({} as () => void);
  const firebase = useContext(FirebaseContext);
  const { state, dispatch } = useContext(store);
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
    winPlayer: null,
    currPlayer: 0,
    score: [0, 0],
    bids: [],
    currRound: 0,
    rounds: [],
    host: '',
    spectators: [],
  });
  const [error, setError] = useState('');
  const { setAuthUserGame } = useAuth();

  useEffect(() => {
    obs.current = firebase.games.doc(gameId).onSnapshot(snapshot => {
      const data = snapshot.data();

      if (data) {
        setGame(data as Game);
        // TODO: Will this work???
        setAuthUserGame(data as Game);
        setError('');
      } else {
        setError('no-game');
      }
    });

    return () => {
      obs.current();
    };
  }, [gameId, firebase, setAuthUserGame]);

  return { game, error };
};
