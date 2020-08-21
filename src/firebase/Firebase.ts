/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-param-reassign */
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { Game, BidSuit, Phase } from '../models';
import { createSplitDeck } from '../utils/cards';

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

  public db: app.firestore.Firestore;

  public games: app.firestore.CollectionReference<app.firestore.DocumentData>;

  constructor() {
    if (!app.apps.length) {
      try {
        app.initializeApp(config);
      } catch (err) {
        console.error('app error', err.stack);
      }

      this.auth = app.auth();
      this.db = app.firestore();
      this.db.settings({
        timestampsInSnapshots: true,
      });

      this.games = this.db.collection('games');
    } else {
      this.auth = {} as app.auth.Auth;
      this.db = {} as app.firestore.Firestore;
      this.games = {} as app.firestore.CollectionReference<
        app.firestore.DocumentData
      >;
    }
  }

  // Auth API
  // TODO: Move
  signupUser = async (email: string, password: string, username: string) => {
    try {
      const user = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );

      if (user.user) {
        const res = await user.user.updateProfile({
          displayName: username,
        });

        return res;
      }
    } catch (err) {
      return err;
    }
  };

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

  // GAMES
  getGame = async (gameId: string) => {
    try {
      const game = await this.games.doc(gameId).get();
      return game.data();
    } catch (err) {
      return err;
    }
  };

  createGame = async (username: string) => {
    try {
      const game: Game = {
        name: '',
        players: [username],
        playerInfo: {
          [username]: {
            username,
            team: 0,
            bid: {
              suit: BidSuit.none,
              value: 1,
            },
            cards: [],
          },
        },
        phase: Phase.lobby,
        winBid: null,
        winTeam: null,
        currPlayer: 0,
        score: [0, 0],
      };
      const res = await this.games.add({ ...game });

      return res;
    } catch (err) {
      return err;
    }
  };

  joinGame = async (gameId: string, username: string, team: number) => {
    try {
      const userUpdate = `playerInfo.${username}`;
      const res = await this.games.doc(gameId).update({
        players: app.firestore.FieldValue.arrayUnion(username),
        [userUpdate]: {
          username,
          team,
          bid: {
            suit: BidSuit.none,
            value: 1,
          },
          cards: [],
        },
      });
      return res;
    } catch (err) {
      return err;
    }
  };

  leaveGame = async (gameId: string, username: string) => {
    try {
      const res = await this.games.doc(gameId).update({
        players: app.firestore.FieldValue.arrayRemove(username),
        [`playerInfo.${username}`]: app.firestore.FieldValue.delete(),
      });

      return res;
    } catch (err) {
      return err;
    }
  };

  startBidding = async (gameId: string) => {
    try {
      const deck = createSplitDeck();
      const getGame = await this.games.doc(gameId).get();
      const gameData = getGame.data() as Game;
      let cards = {};

      gameData.players.forEach((player, i) => {
        cards = {
          ...cards,
          [`playerInfo.${player}.cards`]: deck[i],
        };
      });

      const res = await this.games.doc(gameId).update({
        phase: Phase.bid,
      } as Partial<Game>);

      return res;
    } catch (err) {
      return err;
    }
  };

  deleteGame = async (gameId: string) => {
    try {
      const res = await this.games.doc(gameId).delete();
      return res;
    } catch (err) {
      return err;
    }
  };
}

export default Firebase;
