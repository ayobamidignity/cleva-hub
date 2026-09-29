import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Fetch catalog rewards and the user's redemption history
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rewards = await prisma.reward.findMany({
      orderBy: { pointCost: "asc" },
    });

    // Auto-seed default rewards if catalog is empty
    if (rewards.length === 0) {
      await prisma.reward.createMany({
        data: [
          {
            title: "₦5,000 Airtime / Data Top-up",
            description: "Direct instant airtime or data voucher sent directly to your registered campus phone line.",
            pointCost: 350,
            category: "Voucher",
          },
          {
            title: "Cleva Ambassador Merch Pack",
            description: "Includes official Cleva heavy-cotton branded hoodie, metal water bottle, and enamel pin set.",
            pointCost: 650,
            category: "Merch",
          },
          {
            title: "₦15,000 Amazon / Shoprite Gift Card",
            description: "Digital shopping voucher valid for groceries, essentials, or online purchases.",
            pointCost: 950,
            category: "Voucher",
          },
          {
            title: "VIP Fintech Summit Pass",
            description: "All-access ticket to the Q4 West Africa Fintech Conference with exclusive speaker lounge access.",
            pointCost: 1400,
            category: "VIP Perks",
          },
        ],
      });

      rewards = await prisma.reward.findMany({
        orderBy: { pointCost: "asc" },
      });
    }

    // Fetch user current balance and history
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        redemptions: {
          include: { reward: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      balance: user?.pointsBalance || 0,
      rewards,
      redemptions: user?.redemptions || [],
    });
  } catch (error: any) {
    console.error("Rewards fetch error:", error);
    return NextResponse.json({ error: "Failed to load rewards" }, { status: 500 });
  }
}

// POST: Redeem a perk
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rewardId, notes } = await req.json();
    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 });
    }

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.pointsBalance < reward.pointCost) {
      return NextResponse.json(
        { error: `Insufficient points balance. You need ${reward.pointCost - user.pointsBalance} more points.` },
        { status: 400 }
      );
    }

    // Atomic transaction: deduct points and create redemption record
    const [updatedUser, redemption] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          pointsBalance: {
            decrement: reward.pointCost,
          },
        },
      }),
      prisma.redemption.create({
        data: {
          rewardId,
          userId: user.id,
          pointsPaid: reward.pointCost,
          status: "PROCESSING",
          notes: notes?.trim() || null,
        },
        include: { reward: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Redeemed ${reward.title}! Points deducted.`,
      newBalance: updatedUser.pointsBalance,
      redemption,
    });
  } catch (error: any) {
    console.error("Redemption error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process redemption" }, { status: 500 });
  }
}