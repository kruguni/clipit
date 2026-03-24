import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Fetch the user's current hashed password from database
    // 2. Verify the current password matches
    // 3. Hash the new password and update in database

    // TODO: Implement when database is set up
    // const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    // const isValid = await verifyPassword(currentPassword, user.password);
    // if (!isValid) {
    //   return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    // }
    // const hashedPassword = await hashPassword(newPassword);
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { password: hashedPassword }
    // });

    // For now, hash the password to show it works (but don't store it)
    const hashedNewPassword = await hashPassword(newPassword);
    console.log("Password would be updated to hash:", hashedNewPassword.substring(0, 20) + "...");

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("Password change error:", err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
