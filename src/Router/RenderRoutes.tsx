// route props are already declared in RotueObject. Not necessary to spread.
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { RouteObject } from './model';
import ProtectedRoute from './ProtectedRoute';

interface IRenderRoutes {
  routes: RouteObject[];
  isAuthenticated: boolean;
}

const RenderRoutes: React.FC<IRenderRoutes> = ({
  routes,
  isAuthenticated,
}: IRenderRoutes) => {
  return (
    <Switch>
      {routes.map(route => {
        return (
          <ProtectedRoute
            key={route.name}
            {...route}
            isAuthenticated={isAuthenticated}
          />
        );
      })}
      <Route component={() => <h1>Not Found!</h1>} />
    </Switch>
  );
};

export default RenderRoutes;
