import React from 'react';

import './App.scss';
import Router from './Router/Router';
import { FirebaseProvider } from './firebase/useFirebase';
import ROOT_ROUTES from './pages/rootRoutes';
import { StateProvider } from './store/store';
import setupFALibrary from './utils/setupFontAwesome';

setupFALibrary();

const App: React.FC = () => (
  <FirebaseProvider>
    <StateProvider>
      <Router rootRoutes={ROOT_ROUTES} />
    </StateProvider>
  </FirebaseProvider>
);

export default App;
