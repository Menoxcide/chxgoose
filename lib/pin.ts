export const PIN_COOKIE = "billie_pin_v2";

export const PIN_COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
};

export function hasPinCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === PIN_COOKIE && value === "1";
  });
}
