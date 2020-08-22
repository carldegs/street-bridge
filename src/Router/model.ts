import { RouteProps } from 'react-router-dom';

import { Game } from '../models';

export interface RouteObject extends RouteProps {
  path: string;
  name: string;
  // No fixed props for route components.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.FC<any>;
  routes?: RouteObject[];
  isPublic?: boolean;
  hideOnAuth?: boolean;
  // expectedRole?: UserRole | UserRole[];
  title?: string;
  hideNavbar?: boolean;
  customCheck?: (
    authUser: firebase.User | null,
    game: Game | null
  ) => void | string;
}
