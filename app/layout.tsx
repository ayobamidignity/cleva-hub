import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cleva Hub | Campus Ambassador Portal",
  description: "Manage campus events, track tasks, and redeem rewards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FBF9F5] text-stone-900 font-sans selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}