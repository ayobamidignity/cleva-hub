import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto-seed sample ambassadors if leaderboard is small for a realistic demo
    const totalUsers = await prisma.user.count({ where: { role: "AMBASSADOR" } });
    if (totalUsers < 4) {
      await prisma.user.createMany({
        data: [
          {
            email: "femi.o@unilag.edu.ng",
            fullName: "Femi Oladipo",
            campus: "University of Lagos (UNILAG)",
            role: "AMBASSADOR",
            pointsBalance: 1250,
          },
          {
            email: "chioma.n@ui.edu.ng",
            fullName: "Chioma Nwosu",
            campus: "University of Ibadan (UI)",
            role: "AMBASSADOR",
            pointsBalance: 980,
          },
          {
            email: "tunde.b@oau.edu.ng",
            fullName: "Tunde Bakare",
            campus: "Obafemi Awolowo University (OAU)",
            role: "AMBASSADOR",
            pointsBalance: 740,
          },
          {
            email: "zainab.a@abu.edu.ng",
            fullName: "Zainab Ahmed",
            campus: "Ahmadu Bello University (ABU)",
            role: "AMBASSADOR",
            pointsBalance: 420,
          },
        ],
        skipDuplicates: true,
      });
    }

    // Ensure current session user exists in Prisma
    const currentUser = await prisma.user.upsert({
      where: { id: session.id },
      update: {},
      create: {
        id: session.id,
        email: session.email,
        fullName: session.fullName,
        campus: "University of Lagos (UNILAG)",
        role: "AMBASSADOR",
        pointsBalance: 550,
      },
      include: {
        submissions: {
          where: { status: "APPROVED" },
        },
        registrations: {
          where: { attended: true },
        },
      },
    });

    // Fetch ranked leaderboard
    const allAmbassadors = await prisma.user.findMany({
      where: { role: "AMBASSADOR" },
      orderBy: { pointsBalance: "desc" },
      select: {
        id: true,
        fullName: true,
        campus: true,
        pointsBalance: true,
      },
    });

    // Compute rank
    const userRankIndex = allAmbassadors.findIndex((a) => a.id === currentUser.id);
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : allAmbassadors.length + 1;

    // Determine Tier
    const pts = currentUser.pointsBalance;
    let tier = "Bronze";
    let nextTier = "Silver";
    let nextTierPoints = 500;

    if (pts >= 1500) {
      tier = "Platinum";
      nextTier = "Max Tier";
      nextTierPoints = 1500;
    } else if (pts >= 800) {
      tier = "Gold";
      nextTier = "Platinum";
      nextTierPoints = 1500;
    } else if (pts >= 400) {
      tier = "Silver";
      nextTier = "Gold";
      nextTierPoints = 800;
    }

    const progressPercent = Math.min(
      100,
      Math.round((pts / nextTierPoints) * 100)
    );

    return NextResponse.json({
      user: {
        ...currentUser,
        rank: userRank,
        tier,
        nextTier,
        nextTierPoints,
        progressPercent,
        referralCode: `CLEVA-${currentUser.fullName.split(" ")[0].toUpperCase()}-${currentUser.id.slice(-4).toUpperCase()}`,
        approvedTasksCount: currentUser.submissions.length,
        eventsAttendedCount: currentUser.registrations.length,
      },
      leaderboard: allAmbassadors.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}