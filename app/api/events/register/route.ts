import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Ensure user exists in Prisma
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: "AMBASSADOR",
      },
    });

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Already registered",
        registration: existing,
      });
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event!",
      registration,
    });
  } catch (error: any) {
    console.error("Event registration error:", error);
    return NextResponse.json({ error: error?.message || "Registration failed" }, { status: 500 });
  }
}