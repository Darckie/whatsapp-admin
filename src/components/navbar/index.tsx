import React from "react";
import { FiAlignJustify, FiLogOut, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
}) => {
  const navigate = useNavigate();
  const { onOpenSidenav, brandText } = props;
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/sign-in");
  };

  const today = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#f6f5f2]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 lg:hidden"
            onClick={onOpenSidenav}
          >
            <FiAlignJustify className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Workspace
            </p>
            <h1 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-zinc-950">
              {brandText}
            </h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative hidden w-full max-w-[320px] md:block">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search campaigns, templates, contacts"
              className="h-11 w-full rounded-[6px] border border-zinc-200 bg-white pl-10 pr-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="hidden rounded-[6px] border border-zinc-200 bg-white px-3 py-2 text-right md:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Today
            </p>
            <p className="text-sm font-medium text-zinc-700">{today}</p>
          </div>

          <div className="flex items-center gap-3 rounded-[6px] border border-zinc-200 bg-white px-3 py-2">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium text-zinc-900">{user?.full_name}</p>
              <p className="text-xs text-zinc-400">{user?.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-blue-50 text-[13px] font-semibold text-blue-700">
              {user?.full_name
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-blue-100 bg-blue-50 px-3 text-[13px] font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <FiLogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
