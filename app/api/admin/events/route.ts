import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Retrieve all events with real check-in counts
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const events = await prisma.event.findMany({
      orderBy: { eventDate: "desc" },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    console.error("Admin events GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST: Create a new event
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const locationOrLink =
      typeof body.locationOrLink === "string" ? body.locationOrLink.trim() : "";
    const format = body.format;
    const eventDate = new Date(body.eventDate);
    const pointValue = Number(body.pointValue);

    if (!title || !description || !locationOrLink) {
      return NextResponse.json(
        { error: "Title, description, and location or link are required." },
        { status: 400 }
      );
    }

    if (format !== "IN_PERSON" && format !== "VIRTUAL") {
      return NextResponse.json(
        { error: "Format must be IN_PERSON or VIRTUAL." },
        { status: 400 }
      );
    }

    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: "Enter a valid date and time." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(pointValue) || pointValue < 0) {
      return NextResponse.json(
        { error: "Points must be a whole number, 0 or greater." },
        { status: 400 }
      );
    }

    // 4-digit check-in OTP code for attendance verification
    const checkInOtp = String(randomInt(0, 10000)).padStart(4, "0");

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate,
        format,
        locationOrLink,
        pointValue,
        checkInOtp,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Admin event create error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}