import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';

import './App.scss';
import Router from './Router/Router';
import { FirebaseProvider } from './firebase/useFirebase';
import { StateProvider } from './store/store';
import setupFALibrary from './utils/setupFontAwesome';
import { AuthProvider } from './store/useAuth';
import theme from './theme';

setupFALibrary();

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <FirebaseProvider>
        <AuthProvider>
          <StateProvider>
            <Router />
          </StateProvider>
        </AuthProvider>
      </FirebaseProvider>
    </ChakraProvider>
  );
};

export default App;
