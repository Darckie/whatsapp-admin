import React, { useState } from "react";
import { BsChevronBarLeft, BsChevronBarRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { RoutesType } from "types/routes";


const SidebarItem = ({
  route,
  activeRoute,
}: {
  route: RoutesType;
  activeRoute: (name: string) => boolean;
}) => {
  const [open, setOpen] = useState(false);

  if (route.children && route.children.length > 0) {
    return (
      <div className="px-4">
        <div
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-navy-700 ${
            activeRoute(route.path) ? "bg-gray-100 dark:bg-navy-700" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {route.icon && <span>{route.icon}</span>}
            <span className="text-gray-700 dark:text-gray-200">{route.name}</span>
          </div>
          {open ? (
            <BsChevronBarLeft size={16} className="text-gray-500" />
          ) : (
            <BsChevronBarRight size={16} className="text-gray-500" />
          )}
        </div>

        {open && (
          <ul className="ml-5 border-l border-gray-300 dark:border-navy-600 mt-1">
            {route.children.map((child, index) => (
              <Link key={index} to={`${child.layout}/${child.path}`}>
                <li
                  className={`flex items-center gap-2 py-1.5 pl-3 text-sm hover:text-brand-500 ${
                    activeRoute(child.path)
                      ? "text-brand-500 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {child.icon && <span>{child.icon}</span>}
                  {child.name}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Link to={`${route.layout}/${route.path}`}>
      <div
        className={`flex items-center gap-3 py-2.5 px-7 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-navy-700 ${
          activeRoute(route.path)
            ? "bg-gray-100 dark:bg-navy-700 text-brand-500 font-semibold"
            : "text-gray-700 dark:text-gray-200"
        }`}
      >
        {route.icon && <span>{route.icon}</span>}
        <span>{route.name}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;
