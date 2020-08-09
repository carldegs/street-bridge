import React, { useContext, ReactNode } from 'react';

import Firebase from './Firebase';

const FirebaseContext = React.createContext({} as Firebase);

export const useFirebase = (): Firebase => {
  const firebase = useContext(FirebaseContext);

  return firebase;
};

interface IFirebaseProvider {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<IFirebaseProvider> = ({
  children,
}: IFirebaseProvider) => {
  const firebase = new Firebase();

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;
