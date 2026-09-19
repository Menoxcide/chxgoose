export const PIN_COOKIE = "billie_pin_v2";
export const BOOK_COOKIE = "billie_book_v1";

export const PIN_COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
};

function hasCookie(cookieHeader: string | null, key: string): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === key && value === "1";
  });
}

export function hasPinCookie(cookieHeader: string | null): boolean {
  return hasCookie(cookieHeader, PIN_COOKIE);
}

export function hasBookCookie(cookieHeader: string | null): boolean {
  return hasCookie(cookieHeader, BOOK_COOKIE);
}
