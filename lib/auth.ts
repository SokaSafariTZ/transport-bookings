import { cookies } from "next/headers";
import crypto from "crypto";
import { ADMIN_COOKIE as COOKIE } from "@/lib/auth-edge";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@sokasafari.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "sokasafari";
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "dev-secret-change-me";

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function verifyCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
}

export async function createAdminSession(email: string) {
  const payload = `${email}.${Date.now()}`;
  const token = `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export function isValidToken(token: string | undefined) {
  if (!token) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;
  const payload = Buffer.from(payloadB64, "base64url").toString();
  return crypto.timingSafeEqual(Buffer.from(sign(payload)), Buffer.from(sig));
}

export async function isAdminAuthed() {
  const store = await cookies();
  return isValidToken(store.get(COOKIE)?.value);
}

export { COOKIE as ADMIN_COOKIE };
