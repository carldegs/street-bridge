/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-param-reassign */
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { sample, range } from 'lodash';

import { Game, BidSuit, Phase, Bid, Card, CardSuit } from '../models';
import { createSplitDeck } from '../utils/cards';
import { getScoreToWin } from '../utils/bids';
import objToArr from '../utils/array';

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

  public googleProvider: app.auth.GoogleAuthProvider;

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

      this.googleProvider = new app.auth.GoogleAuthProvider();

      this.games = this.db.collection('games');
    } else {
      this.auth = {} as app.auth.Auth;
      this.db = {} as app.firestore.Firestore;
      this.games = {} as app.firestore.CollectionReference<app.firestore.DocumentData>;
      this.googleProvider = {} as app.auth.GoogleAuthProvider;
    }
  }

  // Auth API
  // TODO: Move
  // eslint-disable-next-line consistent-return
  signupUser = async (email: string, password: string, username: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const user = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );

      if (user.user) {
        // eslint-disable-next-line no-useless-catch
        try {
          await user.user.updateProfile({
            displayName: username,
          });

          const res = await user.user.sendEmailVerification({
            url: window.location.origin || 'http://localhost:3000',
          });
          return res;
        } catch (err) {
          throw err;
        }
      }
    } catch (err) {
      throw err;
    }
  };

  loginUser = async (
    email: string,
    password: string
  ): Promise<app.auth.UserCredential> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await this.auth.signInWithEmailAndPassword(email, password);

      if (res.user?.emailVerified || process.env.NODE_ENV === 'development') {
        return res;
      }

      if (res.user?.sendEmailVerification) {
        res.user.sendEmailVerification({
          url: window.location.origin || 'http://localhost:3000',
        });
      }
      this.auth.signOut();
      throw new Error(
        'Your account is not yet verified. Check your email to finish the verification process.'
      );
    } catch (err) {
      throw err;
    }
  };

  loginUserWithGoogle = async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await this.auth.signInWithPopup(this.googleProvider);
      return res;
    } catch (err) {
      throw err;
    }
  };

  getUserSignInMethod = (): string[] => {
    let signInMethods: string[] = [];
    if (this.auth.currentUser?.providerData) {
      signInMethods = this.auth.currentUser.providerData.map(data =>
        data?.providerId ? data.providerId : 'unknown'
      );
    }

    return signInMethods;
  };

  isGoogleUserFirstLogin = () => {
    const { providerData, displayName } = this.auth.currentUser || {};
    if (providerData && displayName) {
      let isFirstLogin = false;
      providerData.forEach(data => {
        if (
          data?.providerId === 'google.com' &&
          displayName === data.displayName
        ) {
          isFirstLogin = true;
        }
      });

      return isFirstLogin;
    }

    return false;
  };

  updateUser = (data: { displayName?: string; photoURL?: string }) => {
    if (this.auth.currentUser && Object.keys(data).length) {
      this.auth.currentUser.updateProfile(data);
    }
  };

  sendResetPasswordMail = (email: string) =>
    this.auth.sendPasswordResetEmail(email, { url: window.location.origin });

  deleteUser = async (email: string, password?: string) => {
    const signInMethods = this.getUserSignInMethod();

    // eslint-disable-next-line no-useless-catch
    try {
      if (signInMethods.includes('password') && !!password) {
        await this.auth.signInWithEmailAndPassword(email, password);
      } else if (signInMethods.includes('google.com')) {
        await this.auth.signInWithPopup(this.googleProvider);
      }
    } catch (err) {
      throw err;
    }

    if (this.auth.currentUser) {
      await this.auth.currentUser.delete();
    }
  };

  logoutUser = (): Promise<void> => this.auth.signOut();

  resetPassword = (email: string): Promise<void> =>
    this.auth.sendPasswordResetEmail(email);

  updatePassword = async (
    email: string,
    password: string,
    newPassword: string
  ) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.auth.signInWithEmailAndPassword(email, password);
      const res = await this.auth.currentUser?.updatePassword(newPassword);
      return res;
    } catch (err) {
      throw err;
    }
  };

  // GAMES
  getGame = async (gameId: string) => {
    try {
      const game = await this.games.doc(gameId).get();
      return game.data();
    } catch (err) {
      return err;
    }
  };

  createGame = async (username: string, name: string) => {
    try {
      const game: Game = {
        name,
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
        winBid: undefined,
        winTeam: undefined,
        winPlayer: undefined,
        currPlayer: 0,
        score: [0, 0],
        bids: [],
        currRound: 0,
        rounds: [],
        host: username,
        spectators: [],
        teamNames: ['Team A', 'Team B'],
      };
      const res = await this.games.add({ ...game });
      return res.id;
    } catch (err) {
      return err;
    }
  };

  joinGame = async (gameId: string, username: string, team: number) => {
    try {
      const res = await this.db.runTransaction(async transaction => {
        const userUpdate = `playerInfo.${username}`;
        const gameRef = this.games.doc(gameId);

        return transaction.get(gameRef).then(async getGame => {
          if (!getGame.exists) {
            throw new Error('Game does not exist!');
          }

          const data = getGame.data() as Game;

          transaction.update(gameRef, {
            players: app.firestore.FieldValue.arrayUnion(username),
            spectators: app.firestore.FieldValue.arrayRemove(username),
            [userUpdate]: {
              username,
              team,
              bid: {
                suit: BidSuit.none,
                value: 1,
              },
              cards: [],
            },
            ...(!data.host ? { host: username } : {}),
          });
        });
      });
      return res;
    } catch (err) {
      return err;
    }
  };

  spectateGame = async (gameId: string, username: string) => {
    const res = await this.db.runTransaction(async transaction => {
      const gameRef = this.games.doc(gameId);

      return transaction.get(gameRef).then(async getGame => {
        if (!getGame.exists) {
          throw new Error('Game does not exist');
        }

        const data = getGame.data() as Game;

        let updateData = {};

        if (!data.spectators.some(s => s === username)) {
          updateData = {
            ...updateData,
            spectators: app.firestore.FieldValue.arrayUnion(username),
          };
        }

        if (data.players.some(s => s === username)) {
          updateData = {
            ...updateData,
            players: app.firestore.FieldValue.arrayRemove(username),
          };
        }

        if (data.playerInfo[username]?.username) {
          updateData = {
            ...updateData,
            [`playerInfo.${username}`]: app.firestore.FieldValue.delete(),
          };
        }

        transaction.update(gameRef, updateData);
      });
    });

    return res;
  };

  changeHost = async (gameId: string, host: string) => {
    const res = await this.games.doc(gameId).update({
      host,
    });

    return res;
  };

  leaveGame = async (gameId: string, username: string) => {
    try {
      const res = await this.db.runTransaction(async transaction => {
        const gameRef = this.games.doc(gameId);

        return transaction.get(gameRef).then(async getGame => {
          if (!getGame.exists) {
            throw new Error('Game does not exist!');
          }

          const data = getGame.data() as Game;
          const remainingPlayers = data.players.filter(
            player => player !== username
          );

          transaction.update(gameRef, {
            players: app.firestore.FieldValue.arrayRemove(username),
            spectators: app.firestore.FieldValue.arrayRemove(username),
            [`playerInfo.${username}`]: app.firestore.FieldValue.delete(),
            ...(data.host === username
              ? {
                  host: remainingPlayers.length ? remainingPlayers[0] : '',
                }
              : {}),
          });
        });
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
          const bidsArr = objToArr(data.bids);

          let numPass = 0;
          // eslint-disable-next-line no-plusplus
          for (let b = bidsArr.length - 1; b >= 0; b--) {
            if (bidsArr[b].suit === BidSuit.pass) {
              numPass += 1;
            } else {
              break;
            }
          }

          let currPlayer = (data.currPlayer + 1) % 4;

          const enoughPassed = numPass === 2 && bid.suit === BidSuit.pass;
          const maxBidReached = bid.suit === BidSuit.noTrump && bid.value === 6;

          if (enoughPassed) {
            const bidWinner = Object.values(data.playerInfo).filter(
              info =>
                info.username !== username && info.bid.suit !== BidSuit.pass
            )[0];
            const bidWinnerPosition =
              data.players.indexOf(bidWinner.username) || data.currPlayer;
            currPlayer = (bidWinnerPosition + 1) % 4;
          }

          transaction.update(gameRef, {
            [`playerInfo.${username}.bid.suit`]: bid.suit,
            [`playerInfo.${username}.bid.value`]: bid.value,
            [`bids.${numBids}.suit`]: bid.suit,
            [`bids.${numBids}.value`]: bid.value,
            [`bids.${numBids}.username`]: username,
            currPlayer,
            ...(bid.suit !== BidSuit.pass && {
              winBid: bid,
              winTeam: data.playerInfo[username].team,
              winPlayer: username,
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

  playCard = async (gameId: string, username: string, card: Card) => {
    // TODO: Remove once issue is fixed
    // eslint-disable-next-line no-console
    console.log('DEV TEST', gameId, username, card);

    if (!card) {
      return;
    }

    try {
      const res = await this.db.runTransaction(async transaction => {
        const gameRef = this.games.doc(gameId);
        // eslint-disable-next-line consistent-return
        return transaction.get(gameRef).then(async getGame => {
          if (!getGame.exists) {
            throw new Error('Game does not exist!');
          }

          const data = getGame.data() as Game;
          let nextPlayer = (data.currPlayer + 1) % 4;
          let roundResult: any | null = null;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { winningTeam: wt, winningPlayer: wp, ...currRoundData } =
            data.rounds[data.currRound] || {};

          const isLastTurn =
            currRoundData && Object.keys(currRoundData).length === 3;

          if (isLastTurn) {
            // Compute Winner
            let cards: {
              card: Card;
              player: string;
              team: number;
            }[] = [];

            data.players.forEach(player => {
              cards = [
                ...cards,
                {
                  card: currRoundData[player]
                    ? (currRoundData[player] as Card)
                    : card,
                  player,
                  team: data.playerInfo[player].team,
                },
              ];
            });

            const winBid = data.winBid || { suit: BidSuit.noTrump, value: 1 };

            const trumpSuit =
              winBid.suit !== BidSuit.noTrump &&
              cards
                .filter(c => c)
                .some(
                  c => c.card.suit === ((winBid.suit as unknown) as CardSuit)
                )
                ? ((winBid.suit as unknown) as CardSuit)
                : (((currRoundData[
                    data.players[(data.currPlayer + 1) % 4]
                  ] as Card).suit as unknown) as CardSuit);

            const trumpCards = cards
              .filter(c => c.card.suit === trumpSuit)
              .sort((a, b) => b.card.value - a.card.value);

            const winningPlayer = trumpCards[0].player;
            const winningTeam = trumpCards[0].team;

            const scoreTeam0 = data.score[0] + (winningTeam === 0 ? 1 : 0);
            const scoreTeam1 = data.score[1] + (winningTeam === 1 ? 1 : 0);

            let phase = Phase.game;
            if (data.winBid?.value) {
              const scoresToWin = [
                getScoreToWin(data.winTeam === 0, data.winBid.value),
                getScoreToWin(data.winTeam === 1, data.winBid.value),
              ];

              if (
                scoreTeam0 >= scoresToWin[0] ||
                scoreTeam1 >= scoresToWin[1]
              ) {
                phase = Phase.post;
              }
            }

            nextPlayer = data.players.indexOf(winningPlayer);
            roundResult = {
              [`rounds.${data.currRound}.winningTeam`]: winningTeam,
              [`rounds.${data.currRound}.winningPlayer`]: winningPlayer,
              score: [scoreTeam0, scoreTeam1],
              phase,
            };
          }

          const updatedPlayerCards = data.playerInfo[username].cards.map(c => ({
            ...c,
            turnUsed:
              c.suit === card.suit && c.value === card.value
                ? data.currRound
                : c.turnUsed,
          }));

          if (isLastTurn) {
            transaction.update(gameRef, {
              [`playerInfo.${username}.cards`]: updatedPlayerCards,
              [`rounds.${data.currRound}.${username}.suit`]: card.suit,
              [`rounds.${data.currRound}.${username}.value`]: card.value,
              [`rounds.${data.currRound}.${username}.turnUsed`]: data.currRound,
              ...(roundResult && { ...roundResult }),
            });

            return {
              currPlayer: nextPlayer,
              ...(roundResult && { currRound: data.currRound + 1 }),
            };
          }

          transaction.update(gameRef, {
            [`playerInfo.${username}.cards`]: updatedPlayerCards,
            [`rounds.${data.currRound}.${username}.suit`]: card.suit,
            [`rounds.${data.currRound}.${username}.value`]: card.value,
            [`rounds.${data.currRound}.${username}.turnUsed`]: data.currRound,
            currPlayer: nextPlayer,
            ...(roundResult && { ...roundResult }),
          });
        });
      });

      if (res) {
        await new Promise(r => setTimeout(r, 1500));
        this.games.doc(gameId).update(res);
      }

      return res;
    } catch (err) {
      console.error(err);
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

  resetGame = async (gameId: string, players: string[]) => {
    try {
      const playerInfoArr = players.map(username => ({
        [`playerInfo.${username}.bid.suit`]: BidSuit.none,
        [`playerInfo.${username}.bid.value`]: 1,
        [`playerInfo.${username}.cards`]: [],
      }));

      const res = await this.games.doc(gameId).update({
        ...Object.assign({}, ...playerInfoArr.map(i => i)),
        phase: Phase.lobby,
        winBid: null,
        winTeam: null,
        winPlayer: null,
        currPlayer: 0,
        score: [0, 0],
        bids: [],
        currRound: 0,
        rounds: [],
      });

      return res;
    } catch (err) {
      return err;
    }
  };
}

export default Firebase;
