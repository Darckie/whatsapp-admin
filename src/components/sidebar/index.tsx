import React from "react";
import { NavLink } from "react-router-dom";
import { RoutesType } from "types/routes";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { MdOutlineWhatsapp } from "react-icons/md";

interface SidebarProps {
  routes: RoutesType[];
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ routes, open, onClose }) => {
  return (
    <>
      {open ? (
        <button
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-40 bg-zinc-950/20 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -260 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-y-0 left-0 z-50 w-[248px] border-r border-zinc-200 bg-[#fbfbfa] px-4 py-5 shadow-[0_10px_30px_rgba(24,24,27,0.04)] lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-blue-100 text-blue-700">
                <MdOutlineWhatsapp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-[14px] font-semibold text-zinc-950">Pulse Admin</p>
                <p className="text-[11px] text-zinc-400">WhatsApp operations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-zinc-500 transition hover:bg-zinc-100 lg:hidden"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex-1 space-y-1 overflow-y-auto">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Workspace
            </p>

            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={`${route.layout}/${route.path}`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-[6px] border px-3 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-blue-100 bg-blue-50 text-blue-700 shadow-[0_8px_24px_rgba(24,24,27,0.04)]"
                      : "border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                  ].join(" ")
                }
              >
                <span className="text-base">{route.icon}</span>
                <span>{route.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-6 rounded-[8px] border border-blue-100 bg-blue-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Delivery health
            </p>
            <p className="font-display mt-2 text-[22px] font-semibold tracking-[-0.04em] text-blue-700">
              97.8%
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
