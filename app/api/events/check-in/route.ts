import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role === "AMBASSADOR") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { eventId, qrToken, checkInOtp, userId } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let registration;

    if (qrToken) {
      // Find registration by unique QR code token
      registration = await prisma.eventRegistration.findUnique({
        where: { qrCodeToken: qrToken },
        include: { user: true },
      });
    } else if (checkInOtp && userId) {
      // Validate OTP
      if (event.checkInOtp && event.checkInOtp.trim() !== checkInOtp.trim()) {
        return NextResponse.json({ error: "Invalid check-in PIN / OTP" }, { status: 400 });
      }

      registration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        include: { user: true },
      });
    }

    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json({ error: "Registration record not found" }, { status: 404 });
    }

    if (registration.attended) {
      return NextResponse.json({
        message: "Ambassador already checked in",
        registration,
      });
    }

    // Update registration status
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        attended: true,
        checkedInAt: new Date(),
      },
    });

    // Safely update points balance
    try {
      await prisma.user.update({
        where: { id: registration.userId },
        data: {
          pointsBalance: {
            increment: event.pointValue || 0,
          },
        },
      });
    } catch (userPointsErr) {
      console.warn("Could not increment user points, user might need initial balance:", userPointsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Check-in confirmed! Credited ${event.pointValue} points.`,
      registration: updatedRegistration,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error occurred during check-in" },
      { status: 500 }
    );
  }
}