import React from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  IconHome,
  IconMap,
  IconCalendar,
  IconBook,
  IconChart,
  IconTarget,
  IconChat,
  IconLeaf,
  IconApple,
  IconUser,
  IconLightning,
  IconTrophy,
} from "./Icons.jsx";

const LINKS = [
  { to: "/", label: "Dashboard", Icon: IconHome },
  { to: "/plan", label: "My Plan", Icon: IconMap },
  { to: "/schedule", label: "Schedule", Icon: IconCalendar },
  { to: "/exercises", label: "Exercise Vault", Icon: IconBook },
  { to: "/progress", label: "Progress", Icon: IconChart },
  { to: "/goals", label: "Goals", Icon: IconTarget },
  { to: "/coach", label: "AI Coach", Icon: IconChat },
  { to: "/recovery", label: "Recovery", Icon: IconLeaf },
  { to: "/nutrition", label: "Nutrition", Icon: IconApple },
  { to: "/profile", label: "Profile", Icon: IconUser },
];

export default function Sidebar() {
  const { isPremium, missedThisMonth, freeMissLimit, streak } = useApp();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 min-h-screen sticky top-0 z-30 select-none px-6 py-6 gap-4 h-screen overflow-y-auto">
      {/* Brand (Figma: 18px semibold title) */}
      <div className="flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg nav-active flex items-center justify-center">
            <IconLightning className="w-4 h-4 fill-current" />
          </div>
          <div className="leading-tight">
            <span className="block font-display font-semibold text-lg text-bone">FitPath</span>
          </div>
        </NavLink>

        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium"
            title={`${streak}-day streak`}
          >
            <IconLightning className="w-3 h-3 fill-current" />
            <span>{streak}d</span>
          </div>
        )}
      </div>

      {/* Navigation: 14px, 16px icons, active = stone gradient button */}
      <nav className="flex-1 flex flex-col gap-1" aria-label="Main navigation">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 h-10 px-4 rounded-lg text-sm transition-colors ${
                isActive
                  ? "nav-active font-medium"
                  : "text-mistLight hover:bg-surfaceRaised hover:text-bone"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Plan status card */}
      <div className="p-4 rounded-lg bg-surface border border-line">
        {isPremium ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceRaised text-bone flex items-center justify-center">
              <IconTrophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bone flex items-center gap-1.5">
                Pro Athlete <span className="badge-neon py-0 px-1.5 text-[10px]">Active</span>
              </p>
              <p className="text-xs text-mist">Unlimited monthly grace</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-mist font-medium">Free Plan Misses</span>
              <span className={`font-mono font-semibold ${missedThisMonth >= freeMissLimit ? "text-rose-400" : "text-bone"}`}>
                {missedThisMonth} / {freeMissLimit}
              </span>
            </div>
            <div className="progress-track h-2 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  missedThisMonth >= freeMissLimit ? "bg-rose-500" : "bg-stone-900"
                }`}
                style={{ width: `${Math.min(100, (missedThisMonth / freeMissLimit) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-mist leading-relaxed">
              {freeMissLimit - missedThisMonth > 0
                ? `${freeMissLimit - missedThisMonth} allowed misses left this month`
                : "Limit reached: workout lock active"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
