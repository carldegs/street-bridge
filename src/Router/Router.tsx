import React, { useEffect } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import { useFirebase } from '../firebase/useFirebase';
import { Game } from '../models';
import ROOT_ROUTES from '../pages/rootRoutes';
import { useAuth } from '../store/useAuth';

import RenderRoutes from './RenderRoutes';

const Router: React.FC = () => {
  const firebase = useFirebase();
  const {
    state: authState,
    setIsAuthenticating,
    setAuthUserGame,
    setAuthUser,
  } = useAuth();

  useEffect(() => {
    const obs = firebase.auth.onAuthStateChanged(async user => {
      try {
        setIsAuthenticating(true);
        if (
          user &&
          (process.env.NODE_ENV === 'development' ? true : user.emailVerified)
        ) {
          setAuthUser(user);
          // TODO: Check if cause of too many reads
          const res = await firebase.db
            .collection('games')
            .where('players', 'array-contains', user.displayName)
            .get();

          if (res?.docs?.length) {
            const game = res.docs[0].data();
            setAuthUserGame({ ...game, id: res.docs[0].id } as Game);
          }
        }
      } catch (err) {
        console.error('auth error', err);
      }

      setIsAuthenticating(false);
    });

    return () => {
      obs();
    };
  }, [firebase, setIsAuthenticating, setAuthUser, setAuthUserGame]);

  return (
    <BrowserRouter>
      <Switch>
        <RenderRoutes
          routes={ROOT_ROUTES}
          isAuthenticating={authState.isAuthenticating}
          authUser={authState.authUser}
          authUserGame={authState.authUserGame}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
