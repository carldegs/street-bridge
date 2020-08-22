/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-param-reassign */
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { sample, range } from 'lodash';

import { Game, BidSuit, Phase, Bid } from '../models';
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

      return null;
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
            isHost: true,
          },
        },
        phase: Phase.lobby,
        winBid: null,
        winTeam: null,
        currPlayer: 0,
        score: [0, 0],
        bids: [],
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
          isHost: false,
        },
      });
      return res;
    } catch (err) {
      return err;
    }
  };

  leaveGame = async (gameId: string, username: string) => {
    // TODO: Set new host if host left the game.
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
    // TODO: Convert to a transaction
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

      const { playerInfo, players } = gameData;
      const firstPlayerNumber = sample(range(4)) as number;
      const firstPlayer = playerInfo[players[firstPlayerNumber]];
      const firstPlayerTeamMate = Object.values(playerInfo).filter(
        info =>
          info.team === firstPlayer.team &&
          info.username !== firstPlayer.username
      )[0];
      const opposingTeamPlayers = Object.values(playerInfo).filter(
        info => info.team !== firstPlayer.team
      );
      const newPlayers = [
        firstPlayer,
        opposingTeamPlayers[0],
        firstPlayerTeamMate,
        opposingTeamPlayers[1],
      ];

      const res = await this.games.doc(gameId).update({
        ...cards,
        phase: Phase.bid,
        players: newPlayers.map(player => player.username),
        ...(!newPlayers.some(player => player.isHost) && {
          [`playerInfo.${players[0]}.isHost`]: true,
        }),
      } as Partial<Game>);

      return res;
    } catch (err) {
      return err;
    }
  };

  setBid = async (gameId: string, username: string, bid: Bid) => {
    try {
      const res = await this.db.runTransaction(async transaction => {
        const gameRef = this.games.doc(gameId);
        return transaction.get(gameRef).then(getGame => {
          if (!getGame.exists) {
            throw new Error('Game does not exist!');
          }

          const data = getGame.data() as Game;
          const numBids = Object.keys(data.bids).length;
          const numPass = Object.values(data.playerInfo).filter(
            info => info.username !== username && info.bid.suit === BidSuit.pass
          ).length;

          const enoughPassed = numPass === 2 && bid.suit === BidSuit.pass;
          const maxBidReached = bid.suit === BidSuit.noTrump && bid.value === 6;

          transaction.update(gameRef, {
            [`playerInfo.${username}.bid.suit`]: bid.suit,
            [`playerInfo.${username}.bid.value`]: bid.value,
            [`bids.${numBids}.suit`]: bid.suit,
            [`bids.${numBids}.value`]: bid.value,
            [`bids.${numBids}.username`]: username,
            currPlayer: (data.currPlayer + 1) % 4,
            ...(bid.suit !== BidSuit.pass && {
              winBid: bid,
              winTeam: data.playerInfo[username].team,
            }),
            ...((enoughPassed || maxBidReached) && { phase: Phase.game }),
          });
        });
      });

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
