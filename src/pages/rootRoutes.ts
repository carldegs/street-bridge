import { RouteObject } from '../Router/model';

import Landing from './Landing/Landing';
import Home from './Home/Home';
import Signup from './Signup/Signup';
import GameLobby from './GameLobby/GameLobby';
import GameBid from './GameBid/GameBid';

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
    component: GameBid,
  },
];

export default ROOT_ROUTES;
