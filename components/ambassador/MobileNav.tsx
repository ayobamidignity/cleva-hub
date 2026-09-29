"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Calendar, Award, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/ambassador", icon: Home },
  { label: "Tasks", href: "/ambassador/tasks", icon: CheckSquare },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Rewards", href: "/ambassador/rewards", icon: Award },
  { label: "Profile", href: "/ambassador/profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-6 py-2">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-[#2B1704] font-bold" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}