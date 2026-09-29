import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);

    let tasks = await prisma.task.findMany({
      where: { status: "ACTIVE" },
      include: {
        submissions: user
          ? {
              where: { userId: user.id },
              select: { id: true, status: true, proofLink: true, createdAt: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (tasks.length === 0) {
      await prisma.task.createMany({
        data: [
          {
            title: "Create a campus reel",
            description: "Film a 15-30 sec reel showing how Cleva fits into campus life. Tag @getcleva and use #ClevaCampus. Keep it light, authentic, and you.",
            pointValue: 450,
            category: "Content Creation",
            status: "ACTIVE",
          },
          {
            title: "Invite 5 friends to Cleva",
            description: "Get 5 fellow students to sign up using your custom campus referral link.",
            pointValue: 250,
            category: "Referrals",
            status: "ACTIVE",
          },
          {
            title: "Share your Cleva story",
            description: "Post a thread or carousel on LinkedIn or X discussing how you handle student finances with Cleva.",
            pointValue: 300,
            category: "Social Media",
            status: "ACTIVE",
          },
        ],
      });

      tasks = await prisma.task.findMany({
        where: { status: "ACTIVE" },
        include: {
          submissions: user
            ? {
                where: { userId: user.id },
                select: { id: true, status: true, proofLink: true, createdAt: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}