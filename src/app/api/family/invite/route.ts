import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { generateSecureToken } from "@/lib/auth/tokens";
import { sendInvitationEmail } from "@/lib/email/brevo";

// POST /api/family/invite - Create & send invite
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { familyGroupId, email, role } = await req.json();
    if (!familyGroupId || !email) {
      return NextResponse.json({ error: "Family group ID and email are required." }, { status: 400 });
    }

    // Verify requesting user is admin of group or system admin
    const membership = await prisma.familyMembership.findUnique({
      where: {
        familyGroupId_userId: {
          familyGroupId,
          userId: session.id,
        },
      },
    });

    if (!membership || (membership.role !== "ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only family group administrators can invite new members." }, { status: 403 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if target user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          where: { familyGroupId },
        },
      },
    });

    if (existingUser && existingUser.memberships.length > 0) {
      return NextResponse.json({ error: "This user is already a member of this family group." }, { status: 409 });
    }

    // Generate unguessable token valid for 7 days
    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const group = await prisma.familyGroup.findUnique({
      where: { id: familyGroupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Family group not found." }, { status: 404 });
    }

    const invite = await prisma.invitation.create({
      data: {
        familyGroupId,
        email: cleanEmail,
        token,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
        expiresAt,
        createdById: session.id,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendInvitationEmail({
      toEmail: cleanEmail,
      inviterName: session.name,
      familyGroupName: group.name,
      inviteToken: token,
      appUrl,
    });

    const inviteUrl = `${appUrl}/invite/${token}`;

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt,
        inviteUrl,
      },
    });
  } catch (err: unknown) {
    console.error("[Invite API Error]:", err);
    return NextResponse.json({ error: "Failed to create invitation." }, { status: 500 });
  }
}

// GET /api/family/invite?token=... - View invite details
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const invite = await prisma.invitation.findUnique({
      where: { token },
      include: {
        familyGroup: {
          select: { name: true, description: true },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    if (!invite || invite.status !== "PENDING" || new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Invitation is invalid or has expired." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invite: {
        email: invite.email,
        groupName: invite.familyGroup.name,
        groupDescription: invite.familyGroup.description,
        inviterName: invite.creator.name,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (err: unknown) {
    console.error("[Get Invite Error]:", err);
    return NextResponse.json({ error: "Failed to verify invitation." }, { status: 500 });
  }
}
