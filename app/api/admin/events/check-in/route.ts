import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role === "AMBASSADOR") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { qrCodeToken } = await req.json();

    if (!qrCodeToken) {
      return NextResponse.json({ error: "Missing QR Code Token" }, { status: 400 });
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { qrCodeToken },
      include: {
        event: true,
        user: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Invalid ticket or QR token." }, { status: 404 });
    }

    if (registration.attended) {
      return NextResponse.json({
        alreadyCheckedIn: true,
        message: `${registration.user.fullName} is already checked in!`,
        registration,
      });
    }

    // Atomic: Mark attended & credit points
    const [updatedReg] = await prisma.$transaction([
      prisma.eventRegistration.update({
        where: { id: registration.id },
        data: {
          attended: true,
          checkedInAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: registration.userId },
        data: {
          pointsBalance: {
            increment: registration.event.pointValue,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Checked in ${registration.user.fullName}! +${registration.event.pointValue} pts awarded.`,
      registration: {
        ...updatedReg,
        user: registration.user,
        event: registration.event,
      },
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process check-in" }, { status: 500 });
  }
}