import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import MobileNav from "./components/MobileNav.jsx";
import { useApp } from "./context/AppContext.jsx";

import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlanOverview from "./pages/PlanOverview.jsx";
import Schedule from "./pages/Schedule.jsx";
import Exercises from "./pages/Exercises.jsx";
import Progress from "./pages/Progress.jsx";
import Goals from "./pages/Goals.jsx";
import AICoach from "./pages/AICoach.jsx";
import Recovery from "./pages/Recovery.jsx";
import Nutrition from "./pages/Nutrition.jsx";
import Profile from "./pages/Profile.jsx";
import WorkoutPlayer from "./pages/WorkoutPlayer.jsx";
import UpgradeGate from "./pages/UpgradeGate.jsx";

function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-ink text-bone selection:bg-bone selection:text-surface">
      <Sidebar />
      <main className="app-main flex-1 min-w-0 md:my-6 md:mr-6 md:min-h-[calc(100vh-3rem)] rounded-none md:rounded-2xl border-0 md:border pb-24 md:pb-8 overflow-x-hidden relative">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

export default function App() {
  const { plan, isLocked } = useApp();

  if (!plan) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  if (isLocked) {
    return <UpgradeGate />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan" element={<PlanOverview />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/coach" element={<AICoach />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/workout/:offset" element={<WorkoutPlayer />} />
        <Route path="/onboarding" element={<Onboarding redoing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
