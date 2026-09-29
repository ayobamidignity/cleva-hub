import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, proofLink, notes } = await req.json();

    if (!taskId || (!proofLink && !notes)) {
      return NextResponse.json(
        { error: "Please provide a task and a submission link or notes." },
        { status: 400 }
      );
    }

    // Map UserRole safely to Prisma Role enum
    const prismaRole = user.role === "ADMIN" || (user.role as string) === "SUPER_ADMIN" 
      ? "ADMIN" 
      : "AMBASSADOR";

    // Ensure user exists in Prisma
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: prismaRole,
      },
    });

    // Create the submission
    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        userId: user.id,
        proofLink: proofLink ? String(proofLink).trim() : null,
        notes: notes ? String(notes).trim() : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Submission received! Admin will review your proof shortly.",
      submission,
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Failed to submit task proof" }, { status: 500 });
  }
}