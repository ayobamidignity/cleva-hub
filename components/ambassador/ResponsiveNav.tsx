"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CheckSquare,
  Calendar,
  Award,
  User,
  Shield,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/ambassador", icon: Home },
  { label: "Campaigns & Tasks", href: "/ambassador/tasks", icon: CheckSquare },
  { label: "Upcoming Events", href: "/events", icon: Calendar },
  { label: "Points & Rewards", href: "/ambassador/rewards", icon: Award },
  { label: "My Profile", href: "/ambassador/profile", icon: User },
];

export default function ResponsiveNav({ user }: { user?: any }) {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md screens and up) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 bg-[#261505] text-[#FBF9F5] border-r border-[#3a220c] z-30 p-6 justify-between shadow-xl">
        <div>
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center font-black text-amber-300 text-lg">
              C
            </div>
            <div>
              <span className="text-[10px] tracking-widest font-extrabold uppercase text-amber-200/60 block">
                Ambassador Hub
              </span>
              <span className="text-lg font-bold text-white tracking-tight">
                Cleva
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#3A220C] text-amber-300 shadow-sm"
                      : "text-stone-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Admin Switcher */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <Link
            href="/admin/events"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-stone-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Admin Operations
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center">
              {user?.fullName?.charAt(0) || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {user?.fullName || "Cleva Ambassador"}
              </div>
              <div className="text-[10px] text-amber-200/70 truncate">
                {user?.campus || "Campus Ambassador"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-6 py-2.5 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-[#261505] font-extrabold"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}