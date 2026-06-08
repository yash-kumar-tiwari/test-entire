export async function sendWelcomeEmail({ email, handle }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Skipping welcome email.");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await resend.emails.send({
    from: "Bookmarks <onboarding@resend.dev>",
    to: [email],
    subject: "Welcome to Bookmarks",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #111; font-size: 24px;">Welcome to Bookmarks!</h1>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Hi @${handle},
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Your account has been created successfully. Start saving your favorite links and share them with the world.
        </p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/dashboard" style="background-color: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Your public profile: <a href="${appUrl}/${handle}" style="color: #111;">${appUrl}/${handle}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Error sending welcome email:", error);
  }
}
