import React from 'react';

import './App.scss';
import Router from './Router/Router';
import { FirebaseProvider } from './firebase/useFirebase';
import { StateProvider } from './store/store';
import setupFALibrary from './utils/setupFontAwesome';
import { AuthProvider } from './store/useAuth';

setupFALibrary();

const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <StateProvider>
          <Router />
        </StateProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
};

export default App;
