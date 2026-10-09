import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { nanoid } from "nanoid";

export function registerGuestAuthRoutes(app: Express) {
  app.get("/api/auth/guest", async (req: Request, res: Response) => {
    try {
      // Create a random guest ID for the judge/user
      const guestId = `guest_${nanoid(10)}`;
      const guestName = `Münsif ${nanoid(4)}`;

      // Upsert user in database
      await db.upsertUser({
        openId: guestId,
        name: guestName,
        email: null,
        loginMethod: "guest",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(guestId, {
        name: guestName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      // Redirect to dashboard after successful login
      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[Guest Auth] Callback error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Authentication failed", details: errorMessage });
    }
  });
}
