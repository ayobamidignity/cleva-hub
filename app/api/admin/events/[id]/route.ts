import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role === "AMBASSADOR") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
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
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Fetch single event error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role === "AMBASSADOR") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        format: body.format,
        locationOrLink: body.locationOrLink,
        pointValue: body.pointValue !== undefined ? Number(body.pointValue) : undefined,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role === "AMBASSADOR") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}