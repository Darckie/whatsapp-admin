import React from "react";
import { useLocation } from "react-router-dom";
import { RoutesType } from "types/routes";
import SidebarItem from "./SidebarItem";
import { useAuth } from "context/AuthContext";

interface SidebarLinksProps {
  routes: RoutesType[];
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ routes }) => {
  const location = useLocation();
  const { user } = useAuth();

  const activeRoute = (routeName: string) => location.pathname.includes(routeName);

  /**
   * Return a new list where routes (and their children) that the current
   * user doesn't have roles for are removed.  We also drop auth pages.
   */
  const filterByRole = (list: RoutesType[]): RoutesType[] => {
    return list.reduce<RoutesType[]>((acc, route) => {
      // drop auth routes completely
      if (
        route.layout === "/auth" ||
        ["Sign In", "Sign Up", "Forgot Password"].includes(route.name)
      ) {
        return acc;
      }

      if (route.roles && route.roles.length > 0) {
        const userRoles = user?.roles || [];
        if (!route.roles.some((r) => userRoles.includes(r))) {
          return acc;
        }
      }

      const cloned = { ...route } as RoutesType;
      if (route.children && route.children.length > 0) {
        cloned.children = filterByRole(route.children);
      }
      acc.push(cloned);
      return acc;
    }, []);
  };

  const visibleRoutes = filterByRole(routes);

  return (
    <div className="mt-2 space-y-2"> {/* added space between links */}
      {visibleRoutes.map((route, idx) => (
        <SidebarItem key={idx} route={route} activeRoute={activeRoute} />
      ))}
    </div>
  );
};

export default SidebarLinks;
