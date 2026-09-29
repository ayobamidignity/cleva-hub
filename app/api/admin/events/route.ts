import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role === "AMBASSADOR") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    let events = await prisma.event.findMany({
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                campus: true,
                pointsBalance: true,
              },
            },
          },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    if (events.length === 0) {
      await prisma.event.createMany({
        data: [
          {
            title: "Campus Ambassador Orientation & Welcome",
            description: "Kickoff call for all Q4 campus leads. Strategy breakdown, brand guidelines, and reward milestone rollouts.",
            eventDate: new Date(Date.now() + 86400000 * 2),
            format: "IN_PERSON",
            locationOrLink: "Faculty of Arts Lecture Hall, Main Campus",
            pointValue: 150,
            checkInOtp: "7849",
          },
          {
            title: "Cleva Product Demo & Financial Literacy Workshop",
            description: "Interactive session showing students how to leverage multi-currency accounts and peer-to-peer transfers.",
            eventDate: new Date(Date.now() + 86400000 * 6),
            format: "VIRTUAL",
            locationOrLink: "https://meet.google.com/cleva-campus-demo",
            pointValue: 100,
            checkInOtp: "3190",
          },
          {
            title: "Fintech Career Fair & Networking Meetup",
            description: "Connect with tech leaders, hiring managers, and Cleva product teams.",
            eventDate: new Date(Date.now() + 86400000 * 14),
            format: "IN_PERSON",
            locationOrLink: "Student Union Building, Floor 2",
            pointValue: 200,
            checkInOtp: "9042",
          },
        ],
      });

      events = await prisma.event.findMany({
        include: {
          registrations: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  campus: true,
                  pointsBalance: true,
                },
              },
            },
          },
        },
        orderBy: { eventDate: "asc" },
      });
    }

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Admin events fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}