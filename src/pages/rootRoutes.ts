import { RouteObject } from '../Router/model';

import Landing from './Landing';
import Home from './Home';
import Signup from './Signup';
import GameLobby from './GameLobby';
import GameBid from './GameBid';
import GamePlay from './GamePlay';
import Verification from './Verification';

const ROOT_ROUTES: RouteObject[] = [
  {
    path: '/',
    name: 'Landing Page',
    exact: true,
    hideOnAuth: true,
    component: Landing,
    isPublic: true,
    hideNavbar: true,
  },
  {
    path: '/home',
    name: 'Home Page',
    component: Home,
    title: 'Main Lobby',
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    isPublic: true,
    hideNavbar: true,
  },
  {
    path: '/game/lobby/:id',
    name: 'Game Lobby',
    component: GameLobby,
  },
  {
    path: '/game/bid/:id',
    name: 'Bidding',
    component: GameBid,
  },
  {
    path: '/game/play/:id',
    name: 'Gameplay',
    component: GamePlay,
  },
  {
    path: '/game/post/:id',
    name: 'Results',
    component: GamePlay,
  },
  {
    path: '/verify',
    name: 'Verification',
    component: Verification,
    isPublic: true,
    hideNavbar: true,
  },
];

export default ROOT_ROUTES;
