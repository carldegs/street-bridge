import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  public auth: app.auth.Auth;

  public db: app.database.Database;

  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.database();
  }

  // Auth API
  // TODO: Move
  signupUser = (
    email: string,
    password: string
  ): Promise<app.auth.UserCredential> =>
    this.auth.createUserWithEmailAndPassword(email, password);

  loginUser = (
    email: string,
    password: string
  ): Promise<app.auth.UserCredential> =>
    this.auth.signInWithEmailAndPassword(email, password);

  logoutUser = (): Promise<void> => this.auth.signOut();

  resetPassword = (email: string): Promise<void> =>
    this.auth.sendPasswordResetEmail(email);

  updatePassword = (password: string): Promise<void> | undefined =>
    this.auth.currentUser?.updatePassword(password);
}

export default Firebase;
