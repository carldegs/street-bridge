import { RouteProps } from 'react-router-dom';

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
}
