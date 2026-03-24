import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import routes from "routes";
import { RoutesType } from "types/routes";
import { useAuth } from "context/AuthContext";

export default function Admin(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState("Overview");
  const { user } = useAuth();

  const filterRoutesByRole = (routeList: RoutesType[]) => {
    return routeList.reduce<RoutesType[]>((acc, route) => {
      if (route.layout !== "/admin") {
        return acc;
      }

      if (route.roles?.length) {
        const userRoles = user?.roles || [];
        const allowed = route.roles.some((role) => userRoles.includes(role));
        if (!allowed) {
          return acc;
        }
      }

      acc.push(route);
      return acc;
    }, []);
  };

  const allowedRoutes = filterRoutesByRole(routes);

  React.useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const activeRoute = allowedRoutes.find(
      (route) => location.pathname === `${route.layout}/${route.path}`,
    );
    setCurrentRoute(activeRoute?.name || "Overview");
  }, [allowedRoutes, location.pathname]);

  const getRoutes = (list: RoutesType[]) =>
    list.map((route) => (
      <Route key={`${route.layout}-${route.path}`} path={route.path} element={route.component} />
    ));

  document.documentElement.dir = "ltr";

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-zinc-900">
      <Sidebar
        routes={allowedRoutes}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      />

      <div className="lg:pl-[248px]">
        <Navbar
          onOpenSidenav={() => setOpen(true)}
          brandText={currentRoute}
          secondary={false}
          {...rest}
        />

        <main className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <Routes>
              {getRoutes(allowedRoutes)}
              <Route path="/" element={<Navigate to="/admin/default" replace />} />
              <Route path="*" element={<Navigate to="/admin/default" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
