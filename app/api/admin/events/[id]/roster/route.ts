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
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
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

    // Format as CSV
    const rows = [
      ["Full Name", "Email", "Campus", "Attended", "Checked In At"],
      ...event.registrations.map((r) => [
        `"${r.user.fullName || ""}"`,
        `"${r.user.email || ""}"`,
        `"${r.user.campus || "Unassigned"}"`,
        r.attended ? "YES" : "NO",
        r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "N/A",
      ]),
    ];

    const csvContent = rows.map((e) => e.join(",")).join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="roster-${id}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Roster export error:", error);
    return NextResponse.json({ error: "Failed to export roster" }, { status: 500 });
  }
}