import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);

    const events = await prisma.event.findMany({
      include: {
        registrations: user
          ? {
              where: { userId: user.id },
              select: { id: true, attended: true, qrCodeToken: true },
            }
          : false,
      },
      orderBy: { eventDate: "asc" },
    });

    const formatted = events.map((evt) => {
      const userReg = evt.registrations?.[0];
      return {
        ...evt,
        isRegistered: !!userReg,
        attended: userReg?.attended || false,
        qrCodeToken: userReg?.qrCodeToken || null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Events fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}