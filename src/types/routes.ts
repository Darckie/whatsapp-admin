import { ReactElement } from "react";

export interface RoutesType {
  name: string;
  layout: string;
  path: string;
  component: ReactElement;
  icon?: ReactElement;
  secondary?: boolean;
  /**
   * Optional list of roles that are allowed to see/navigate this route.
   * If omitted the route is public to any authenticated user.
   * Roles can be strings like "admin", "superadmin", "agent" etc.
   */
  roles?: string[];
  children?: RoutesType[]; 
}