import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/services/email";

export async function POST(request) {
  try {
    const { email, handle } = await request.json();

    if (!email || !handle) {
      return NextResponse.json(
        { error: "Email and handle are required" },
        { status: 400 }
      );
    }

    await sendWelcomeEmail({ email, handle });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
