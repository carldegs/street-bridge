import React from 'react';

import './App.scss';
import Router from './Router/Router';
import { FirebaseProvider } from './firebase/useFirebase';
import ROOT_ROUTES from './pages/rootRoutes';

const App: React.FC = () => (
  <FirebaseProvider>
    <Router rootRoutes={ROOT_ROUTES} />
  </FirebaseProvider>
);

export default App;
