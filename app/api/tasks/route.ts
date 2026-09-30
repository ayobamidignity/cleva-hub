import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Fetch all active tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST: Admin creates a new task
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const pointValue = Number(body.pointValue);
    const deadline = body.deadline ? new Date(body.deadline) : null;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(pointValue) || pointValue <= 0) {
      return NextResponse.json(
        { error: "Points must be a positive integer" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        pointValue,
        deadline,
        isActive: true,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}