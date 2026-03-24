import React from "react";
import { RoutesType } from "types/routes";
import MainDashboard from "views/admin/default";
import SignIn from "views/auth/SignIn";
import WhatsappCampaign from "views/admin/campaign/WhatsappCampaign";
import TeamInbox from "views/admin/inbox/TeamInbox";
import { ManageTemplate } from "views/admin/templates/ManageTemplates";
import ManageAgents from "views/admin/manageAgents/ManageAgents";
import {
  MdCampaign,
  MdDashboardCustomize,
  MdGroups,
  MdOutlineChat,
  MdOutlineDescription,
} from "react-icons/md";

const routes: RoutesType[] = [
  {
    name: "Overview",
    layout: "/admin",
    path: "default",
    icon: <MdDashboardCustomize className="h-5 w-5" />,
    component: <MainDashboard />,
    roles: ["admin"],
  },
  {
    name: "Campaigns",
    layout: "/admin",
    path: "campaigns",
    icon: <MdCampaign className="h-5 w-5" />,
    component: <WhatsappCampaign />,
    roles: ["admin"],
  },
  {
    name: "Inbox",
    layout: "/admin",
    path: "inbox",
    icon: <MdOutlineChat className="h-5 w-5" />,
    component: <TeamInbox />,
    roles: ["admin"],
  },
  {
    name: "Templates",
    layout: "/admin",
    path: "templates",
    icon: <MdOutlineDescription className="h-5 w-5" />,
    component: <ManageTemplate />,
    roles: ["admin"],
  },
  {
    name: "Team",
    layout: "/admin",
    path: "team",
    icon: <MdGroups className="h-5 w-5" />,
    component: <ManageAgents />,
    roles: ["admin"],
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    component: <SignIn />,
  },
];

export default routes;
