// React-router props are being passed. No need to spread.
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, ReactNode } from 'react';
import { Redirect, Route } from 'react-router-dom';
import startCase from 'lodash/startCase';
import camelCase from 'lodash/camelCase';
import { Spinner } from 'react-bootstrap';

import SBNavbar from '../components/SBNavbar';
import { Game, Phase } from '../models';

import { RouteObject } from './model';

interface ITitlePage {
  title: string;
  children?: ReactNode;
}

const TitlePage: React.FC<ITitlePage> = ({ title, children }: ITitlePage) => {
  useEffect(() => {
    document.title = `${title} - Street Bridge`;
  }, [title]);

  return children as React.ReactElement;
};

interface IProtectedRoute extends RouteObject {
  isAuthenticating: boolean;
  authUser: firebase.User | null;
  authUserGame: Game | null;
  key: string;
}

const ProtectedRoute: React.FC<IProtectedRoute> = ({
  path,
  exact,
  component: Component,
  name,
  routes,
  title,
  isAuthenticating,
  authUser,
  authUserGame,
  isPublic,
  hideOnAuth,
  hideNavbar,
  location,
}: IProtectedRoute) => {
  if (!isPublic) {
    if (isAuthenticating) {
      return (
        <div
          style={{
            width: '100%',
            height: '100vh',
            position: 'absolute',
            background: '#1b1924',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (!authUser || !Component) {
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

    if (
      name === 'Game Lobby' ||
      name === 'Bidding' ||
      name === 'Gameplay' ||
      name === 'Home Page' ||
      name === 'Results'
    ) {
      let phase = Phase.post;

      if (!authUserGame && (name === 'Bidding' || name === 'Gameplay')) {
        return <Redirect to="/home" />;
      }

      if (authUserGame) {
        const id = location?.pathname.split('/')[3] || authUserGame.id;

        switch (name) {
          case 'Game Lobby':
            phase = Phase.lobby;
            break;
          case 'Bidding':
            phase = Phase.bid;
            break;
          case 'Gameplay':
            phase = Phase.game;
            break;
          case 'Results':
            phase = Phase.post;
            break;
          default:
            phase = -1;
            break;
        }

        if (phase > authUserGame.phase || phase < authUserGame.phase) {
          let to = '';
          switch (authUserGame.phase) {
            case Phase.bid:
              to = 'bid';
              break;
            case Phase.lobby:
              to = 'lobby';
              break;
            case Phase.game:
              to = 'play';
              break;
            default:
              to = 'post';
              break;
          }

          return <Redirect to={`/game/${to}/${id}`} />;
        }
      }
    }
  }

  if (hideOnAuth && !!authUser) {
    return <Redirect to="/home" />;
  }

  return (
    <Route
      path={path}
      exact={exact}
      render={props => (
        <TitlePage title={title || startCase(camelCase(name))}>
          {hideNavbar ? (
            <Component
              {...props}
              routes={routes}
              name={name}
              isAuthenticating={isAuthenticating}
              authUser={authUser}
              authUserGame={authUserGame}
            />
          ) : (
            <SBNavbar title={title}>
              <Component
                {...props}
                routes={routes}
                name={name}
                isAuthenticating={isAuthenticating}
                authUser={authUser}
                authUserGame={authUserGame}
              />
            </SBNavbar>
          )}
        </TitlePage>
      )}
    />
  );
};
export default ProtectedRoute;
