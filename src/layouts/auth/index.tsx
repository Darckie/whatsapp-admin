import { Navigate, Route, Routes } from "react-router-dom";
import routes from "routes";

export default function Auth() {
  const authRoutes = routes.filter((route) => route.layout === "/auth");

  document.documentElement.dir = "ltr";

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[440px]">
          <Routes>
            {authRoutes.map((route) => (
              <Route key={route.path} path={`/${route.path}`} element={route.component} />
            ))}
            <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
          </Routes>
        </div>
      </main>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.08),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.05),_transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.56)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.56)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
    </div>
  );
}
