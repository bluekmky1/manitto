import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "default-secret";

const storage = createCookieSessionStorage({
  cookie: {
    name: "manitto_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export interface UserSession {
  userCode: string;
  roomCode: string;
  userId: string;
}

export async function createUserSession(
  userCode: string, 
  roomCode: string, 
  userId: string, 
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userCode", userCode);
  session.set("roomCode", roomCode);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserCode(request: Request): Promise<string | undefined> {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return session.get("userCode");
}

export async function getUserSession(request: Request): Promise<UserSession | undefined> {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const userCode = session.get("userCode");
  const roomCode = session.get("roomCode");
  const userId = session.get("userId");
  
  if (userCode && roomCode && userId) {
    return { userCode, roomCode, userId };
  }
  return undefined;
}

export async function requireUserCode(
  request: Request,
  redirectTo: string = "/join"
) {
  const userCode = await getUserCode(request);
  if (!userCode) {
    throw redirect(redirectTo);
  }
  return userCode;
}

export async function requireUserSession(
  request: Request,
  redirectTo: string = "/join"
): Promise<UserSession> {
  const userSession = await getUserSession(request);
  if (!userSession) {
    throw redirect(redirectTo);
  }
  return userSession;
}

export async function destroySession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/join", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}