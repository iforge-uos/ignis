import { google } from "googleapis";
import env from "@/lib/env";

const auth = new google.auth.GoogleAuth({
  credentials: {
    private_key: env.google.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: env.google.CLIENT_EMAIL,
  },
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

export const calendar = google.calendar({ version: "v3", auth });
