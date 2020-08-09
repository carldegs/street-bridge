// React-router props are being passed. No need to spread.
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, ReactNode } from 'react';
import { Redirect, Route } from 'react-router-dom';
import startCase from 'lodash/startCase';
import camelCase from 'lodash/camelCase';

import { RouteObject } from './model';

interface ITitlePage {
  title: string;
  children?: ReactNode;
}

const TitlePage: React.FC<ITitlePage> = ({ title, children }: ITitlePage) => {
  useEffect(() => {
    document.title = `${title} - Analytics`;
  }, [title]);

  return children as React.ReactElement;
};

interface IProtectedRoute extends RouteObject {
  isAuthenticated?: boolean;
  key: string;
}

const ProtectedRoute: React.FC<IProtectedRoute> = ({
  path,
  exact,
  component: Component,
  name,
  routes,
  title,
  isAuthenticated = false,
  isPublic,
  hideOnAuth,
}: IProtectedRoute) => {
  const hasValidRole = true; // TODO: create role checker
  const showComponent =
    (isPublic || (isAuthenticated && hasValidRole)) && !!Component;

  if (!showComponent) {
    return (
      <Redirect
        to={{
          pathname: '/',
          state: {
            from: path,
          },
        }}
      />
    );
  }

  if (hideOnAuth && isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return (
    <Route
      path={path}
      exact={exact}
      render={props => (
        <TitlePage title={title || startCase(camelCase(name))}>
          <Component
            {...props}
            routes={routes}
            name={name}
            isAuthenticated={isAuthenticated}
          />
        </TitlePage>
      )}
    />
  );
};
export default ProtectedRoute;
