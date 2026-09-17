import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
    userId?: string;
    username?: string;
    isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_PASSWORD || "complex_password_at_least_32_characters_long",
    cookieName: "logistics_admin_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};

export async function getSession() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return session;
}
