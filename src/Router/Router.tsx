import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { useFirebase } from '../firebase/useFirebase';

import { RouteObject } from './model';

import RenderRoutes from './RenderRoutes';

interface IRouter {
  rootRoutes: RouteObject[];
}

const Router: React.FC<IRouter> = ({ rootRoutes }: IRouter) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const firebase = useFirebase();

  useEffect(() => {
    firebase.auth.onAuthStateChanged(user => {
      setAuthenticated(!!user);
    });
  }, [firebase]);

  return (
    <BrowserRouter>
      <RenderRoutes routes={rootRoutes} isAuthenticated={isAuthenticated} />
    </BrowserRouter>
  );
};

export default Router;
