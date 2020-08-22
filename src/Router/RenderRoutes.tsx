// route props are already declared in RotueObject. Not necessary to spread.
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Game } from '../models';

import { RouteObject } from './model';
import ProtectedRoute from './ProtectedRoute';

interface IRenderRoutes {
  routes: RouteObject[];
  isAuthenticating: boolean;
  authUser: firebase.User | null;
  authUserGame: Game | null;
}

const RenderRoutes: React.FC<IRenderRoutes> = ({
  routes,
  isAuthenticating,
  authUser,
  authUserGame,
}: IRenderRoutes) => {
  return (
    <Switch>
      {routes.map(route => {
        return (
          <ProtectedRoute
            key={route.name}
            {...route}
            isAuthenticating={isAuthenticating}
            authUser={authUser}
            authUserGame={authUserGame}
          />
        );
      })}
      <Route component={() => <h1>Not Found!</h1>} />
    </Switch>
  );
};

export default RenderRoutes;
