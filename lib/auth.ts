import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export type UserRole = "ADMIN" | "AMBASSADOR";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  campus?: string | null;
}

export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const devRole = cookieStore.get("cleva_dev_role")?.value as UserRole | undefined;
    const devUser = cookieStore.get("cleva_dev_user")?.value;

    // 1. Check real Supabase Auth first
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser && authUser.email) {
        let user = await prisma.user.findUnique({
          where: { email: authUser.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              id: authUser.id,
              email: authUser.email,
              fullName: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
              role: authUser.user_metadata?.role === "ADMIN" ? "ADMIN" : "AMBASSADOR",
              campus: authUser.user_metadata?.campus || "University of Lagos (UNILAG)",
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role as UserRole,
          campus: user.campus,
        };
      }
    } catch {
      // Supabase not reachable or no session
    }

    // 2. Development Quick-Login Fallback
    if (devUser || process.env.NODE_ENV === "development") {
      const role: UserRole = devRole === "ADMIN" ? "ADMIN" : "AMBASSADOR";
      const email = role === "ADMIN" ? "admin@cleva.com" : "ambassador@cleva.com";
      const fullName = role === "ADMIN" ? "Cleva Admin" : "Amara Okafor";

      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          fullName,
          role,
          campus: "University of Lagos (UNILAG)",
          pointsBalance: 550,
        },
      });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as UserRole,
        campus: user.campus,
      };
    }

    return null;
  } catch (error) {
    console.error("getSessionUser error:", error);
    return null;
  }
}