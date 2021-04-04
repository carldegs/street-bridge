import React, {
  createContext,
  useReducer,
  useContext,
  useCallback,
} from 'react';

import { Game } from '../models';

export enum AuthActions {
  setAuthUser = 1,
  setAuthUserGame,
  setIsAuthenticating,
  logout,
}

export interface AuthState {
  authUser: firebase.User | null;
  authUserGame: Game | null;
  isAuthenticating: boolean;
}

export const authInitState: AuthState = {
  authUser: null,
  authUserGame: null,
  isAuthenticating: true,
};

export const AuthContext = createContext({
  state: authInitState,
  dispatch: {} as React.Dispatch<[AuthActions, any]>,
});

const { Provider } = AuthContext;

export const AuthProvider: React.FC = props => {
  const { children } = props;
  const [state, dispatch] = useReducer(
    (s: AuthState, [type, payload]: [AuthActions, any]) => {
      switch (type) {
        case AuthActions.setAuthUser:
          return {
            ...s,
            authUser: payload,
          };
        case AuthActions.setAuthUserGame:
          return {
            ...s,
            authUserGame: payload,
          };
        case AuthActions.setIsAuthenticating:
          return {
            ...s,
            isAuthenticating: payload,
          };
        case AuthActions.logout:
          return authInitState;
        default:
          return s;
      }
    },
    authInitState
  );

  return (
    <Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </Provider>
  );
};

interface IUseAuth {
  state: AuthState;
  setAuthUser: (authUser: firebase.User | null) => void;
  setAuthUserGame: (authUserGame: Game | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  logout: () => void;
}

export const useAuth = (): IUseAuth => {
  const { state, dispatch } = useContext(AuthContext);
  const setAuthUser = useCallback(
    (authUser: firebase.User | null) =>
      dispatch([AuthActions.setAuthUser, authUser]),
    [dispatch]
  );
  const setAuthUserGame = useCallback(
    (authUserGame: Game | null) =>
      dispatch([AuthActions.setAuthUserGame, authUserGame]),
    [dispatch]
  );
  const setIsAuthenticating = useCallback(
    (isAuthenticating: boolean) =>
      dispatch([AuthActions.setIsAuthenticating, isAuthenticating]),
    [dispatch]
  );
  const logout = useCallback(() => dispatch([AuthActions.logout, null]), [
    dispatch,
  ]);

  return {
    state,
    setAuthUser,
    setAuthUserGame,
    setIsAuthenticating,
    logout,
  };
};
