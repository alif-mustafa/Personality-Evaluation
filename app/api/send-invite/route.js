import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Server-side Supabase client (uses service role key for admin actions) ──
// Falls back to anon key if service role not configured (limited permissions).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * POST /api/send-invite
 * Body: { inviteCode, partnerEmail, inviterName, inviterEmail, assessmentType, appUrl }
 *
 * Sends an invite email to the spouse with a deep link that:
 *   1. Validates their email (no OTP needed)
 *   2. Takes them to spouse-signup or Google sign-in
 *   3. Redirects them to the specific assessment after signup
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { inviteCode, partnerEmail, inviterName, inviterEmail, assessmentType, appUrl } = body;

    if (!inviteCode || !partnerEmail || !appUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build the invite deep link — spouse lands here after clicking the email
    const inviteLink = `${appUrl}/couples/join?code=${inviteCode}&from=${encodeURIComponent(
      inviterEmail || inviterName || "Your partner"
    )}&assessment=${assessmentType || ""}&email=${encodeURIComponent(partnerEmail)}`;

    const supabaseAdmin = getSupabaseAdmin();

    if (supabaseAdmin) {
      // Try to send email via Supabase. We use the "magiclink" style via admin API.
      // This does NOT create an account — it just sends an email.
      // The actual account creation happens on the spouse-signup page.
      try {
        // We store the invite in the DB first so it can be looked up by code.
        // The email is sent as a custom template via Supabase's email system.
        // Since Supabase doesn't support arbitrary custom email sends from the client,
        // we use a workaround: generate a signed-in link to the join page.
        // In production, connect Resend / SendGrid via a Supabase Edge Function.

        // For now: return the link so the primary user can share it,
        // AND attempt to send via Supabase's built-in invite (creates a draft user record).
        const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          partnerEmail,
          {
            redirectTo: inviteLink,
            data: {
              invite_code: inviteCode,
              inviter_email: inviterEmail,
              inviter_name: inviterName,
              assessment_type: assessmentType,
            },
          }
        );

        if (inviteError) {
          // If invite fails (e.g. user already exists), we still return the link
          console.warn("Supabase invite warning:", inviteError.message);
          return NextResponse.json({
            success: true,
            emailSent: false,
            inviteLink,
            warning: inviteError.message,
          });
        }

        return NextResponse.json({ success: true, emailSent: true, inviteLink });
      } catch (err) {
        console.error("Email send error:", err);
        return NextResponse.json({ success: true, emailSent: false, inviteLink });
      }
    }

    // Demo mode — no Supabase configured, just return the link
    return NextResponse.json({ success: true, emailSent: false, inviteLink });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
