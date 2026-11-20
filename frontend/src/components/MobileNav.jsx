import React from "react";
import { NavLink } from "react-router-dom";
import {
  IconHome,
  IconMap,
  IconCalendar,
  IconChart,
  IconUser,
} from "./Icons.jsx";

const LINKS = [
  { to: "/", label: "Home", Icon: IconHome },
  { to: "/plan", label: "Today", Icon: IconMap },
  { to: "/schedule", label: "Schedule", Icon: IconCalendar },
  { to: "/progress", label: "Progress", Icon: IconChart },
  { to: "/profile", label: "Profile", Icon: IconUser },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-line flex justify-around py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 ">
      {LINKS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center relative min-w-[56px] py-1 transition-all ${
              isActive ? "text-bone" : "text-mist hover:text-bone"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isActive ? "nav-active" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 ${isActive ? "font-bold text-bone" : ""}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
