import React, { createContext, useReducer, Dispatch, useContext } from 'react';

export interface GameState {
  name: string;
  id: string;
  userJoined: boolean;
  numPlayers: number;
}

interface State {
  authUser: firebase.User;
  games: GameState[];
}

const initialState: State = {
  authUser: {} as firebase.User,
  games: [] as GameState[],
};

export enum ActionType {
  setAuthUser = 1,
  setGames,
}

type Action =
  | [ActionType.setAuthUser, State['authUser'] | null]
  | [ActionType.setGames, GameState[]];

export const store = createContext({
  state: initialState,
  dispatch: {} as React.Dispatch<Action>,
});

const { Provider } = store;

export const StateProvider: React.FC = props => {
  const { children } = props;
  const [state, dispatch] = useReducer(
    (s = initialState, [type, payload]: Action) => {
      switch (type) {
        case ActionType.setAuthUser:
          return {
            ...s,
            authUser: payload || ({} as State['authUser']),
          };
        case ActionType.setGames:
          return {
            ...s,
            games: payload || ([] as GameState[]),
          };
        default:
          return s;
      }
    },
    initialState
  );

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export const useDispatch = (): React.Dispatch<Action> =>
  useContext(store).dispatch;

export const useStore = (): State => useContext(store).state;
