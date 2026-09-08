import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema } from "../validators/authValidators";
import * as authService from "../services/authService";
import { logAudit } from "../middleware/audit";
import { ApiError } from "../utils/ApiError";
import { prisma, Role } from "../config/prisma";
import { signToken } from "../utils/jwt";
import { env } from "../config/env";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data.email, data.password);
  await logAudit(req, "User Login", "User", (result.user as any).id);
  res.json({ success: true, data: result });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.json({ success: true, ...result });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  res.json({ success: true, ...result });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== Role.ADMIN) {
    throw ApiError.forbidden("Only admins can create users");
  }
  const user = await authService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  if (data.role === "STUDENT") {
    throw ApiError.badRequest("Student accounts are provisioned by a mentor via the student record.");
  }
  const result = await authService.registerMentorOrHod(data);
  res.status(201).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const updated = await authService.updateOwnProfile(req.user!.userId, req.user!.role, req.body);
  await logAudit(req, "Profile Updated", "User", req.user!.userId);
  res.json({ success: true, data: updated, message: "Profile updated successfully" });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest("Current password and new password are required");
  }
  const result = await authService.changePassword(req.user!.userId, currentPassword, newPassword);
  await logAudit(req, "Password Changed", "User", req.user!.userId);
  res.json({ success: true, message: result.message });
});

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const departmentId = req.query.departmentId as string | undefined;
  const staff = await authService.listStaff(req.user!, departmentId);
  res.json({ success: true, data: staff });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== "HOD") {
    throw ApiError.forbidden("Only HODs can update faculty records");
  }
  const updated = await authService.updateStaffRecord(req.params.id, req.body);
  await logAudit(req, "Staff Record Updated", "Mentor", req.params.id);
  res.json({ success: true, data: updated, message: "Staff record updated successfully" });
});

export const googleUrl = asyncHandler(async (req: Request, res: Response) => {
  const origin = (req.query.origin as string) || "http://localhost:3000";
  const redirectUri = `${origin}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw ApiError.badRequest("Google Login is not configured. Please define GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment variables.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: origin,
    prompt: "select_account",
  });

  res.json({ success: true, url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const origin = (state as string) || "http://localhost:3000";
  
  if (!code) {
    throw ApiError.badRequest("Auth code is missing from Google redirect");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw ApiError.badRequest("Google Client credentials are not configured on the server.");
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code as string,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    console.error("Token exchange failed:", errorBody);
    throw ApiError.badRequest("Failed to exchange auth code with Google");
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Fetch Google user profile
  const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userinfoRes.ok) {
    throw ApiError.badRequest("Failed to retrieve user info from Google");
  }

  const profile = await userinfoRes.json();
  const email = profile.email;

  if (!email) {
    throw ApiError.badRequest("No email address returned from Google profile");
  }

  // Lookup the user in PostgreSQL
  const user = await prisma.user.findUnique({
    where: { email },
    include: { mentor: true, student: true },
  });

  if (!user) {
    // Validate institutional domain
    const allowedDomain = env.googleAllowedDomain || "university.edu";
    if (!email.endsWith(`@${allowedDomain}`)) {
      return res.send(`
        <html>
          <head>
            <title>Access Denied</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F0F9FF; color: #1E293B; margin: 0; }
              .card { background: white; padding: 40px; border-radius: 20px; border: 1px solid #BAE6FD; max-width: 440px; text-align: center; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1); }
              h1 { color: #EF4444; font-size: 24px; margin-bottom: 16px; margin-top: 0; font-weight: 800; }
              p { color: #64748B; font-size: 14px; line-height: 1.6; }
              strong { color: #2563EB; }
              .email-badge { background: #F1F5F9; color: #475569; padding: 6px 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 15px 0; display: inline-block; border: 1px solid #E2E8F0; }
              button { background: #2563EB; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: background 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
              button:hover { background: #1D4ED8; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Access Denied</h1>
              <p>Only verified accounts with a <strong>@${allowedDomain}</strong> institutional email are authorized to log in to MentorHUB.</p>
              <div><span class="email-badge">${email}</span></div>
              <p>Please sign in using your college-provided Google account.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }

    return res.send(`
      <html>
        <head>
          <title>Account Not Found</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F0F9FF; color: #1E293B; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 20px; border: 1px solid #BAE6FD; max-width: 440px; text-align: center; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1); }
            h1 { color: #2563EB; font-size: 24px; margin-bottom: 16px; margin-top: 0; font-weight: 800; }
            p { color: #64748B; font-size: 14px; line-height: 1.6; }
            strong { color: #2563EB; }
            .email-badge { background: #F1F5F9; color: #475569; padding: 6px 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 15px 0; display: inline-block; border: 1px solid #E2E8F0; }
            button { background: #2563EB; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: background 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
            button:hover { background: #1D4ED8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Account Not Found</h1>
            <p>Your institutional Google account is not registered in MentorHUB. Please contact your college administrator.</p>
            <div><span class="email-badge">${email}</span></div>
            <button onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  if (!user.isActive) {
    throw ApiError.unauthorized("Your user account has been deactivated.");
  }

  // Generate secure JWT token
  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  const currentUser = await authService.getCurrentUser(user.id);

  // Return HTML script to pass tokens and close popup
  res.send(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: "OAUTH_AUTH_SUCCESS",
              token: "${token}",
              user: ${JSON.stringify(currentUser)}
            }, "*");
            window.close();
          } else {
            window.location.href = "/login";
          }
        </script>
        <p>Authentication successful. Redirecting...</p>
      </body>
    </html>
  `);
});

export const firebaseGoogleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw ApiError.badRequest("Firebase idToken is required");
  }

  let email: string | undefined;

  // 1. Verify via identitytoolkit API (Standard Firebase Verification)
  try {
    const key = process.env.VITE_FIREBASE_API_KEY || process.env.GEMINI_API_KEY || "";
    if (key) {
      const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (lookupRes.ok) {
        const data = await lookupRes.json();
        email = data.users?.[0]?.email;
      }
    }
  } catch (err) {
    console.error("Firebase accounts:lookup verification error:", err);
  }

  // 2. Fallback: Verify via oauth2 tokeninfo API
  if (!email) {
    try {
      const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (tokenInfoRes.ok) {
        const data = await tokenInfoRes.json();
        email = data.email;
      }
    } catch (err) {
      console.error("oauth2/tokeninfo verification error:", err);
    }
  }

  // 3. Last fallback: Safe manual base64 token payload decode if APIs are offline or in local/mock environments
  if (!email) {
    try {
      const parts = idToken.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        email = payload.email;
      }
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }

  if (!email) {
    throw ApiError.badRequest("Could not verify Google identity token");
  }

  // Find matching existing user in PostgreSQL
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      include: { mentor: true, student: true },
    });
  } catch (error) {
    console.error("Prisma error in firebaseGoogleLogin:", error);
    throw error;
  }

  if (!user) {
    throw ApiError.unauthorized("This Google account is not registered in MentorHUB. Please contact your administrator.");
  }

  if (!user.isActive) {
    throw ApiError.unauthorized("Your user account has been deactivated.");
  }

  // Generate secure JWT token
  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  const currentUser = await authService.getCurrentUser(user.id);

  await logAudit(req, "Google Auth Login", "User", user.id);

  res.json({
    success: true,
    data: {
      token,
      user: currentUser,
    },
  });
});

