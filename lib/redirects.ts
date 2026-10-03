export const CANONICAL_HOST = "chxgoose.com";

/** Hosts that must 308 to the apex. Preview URLs stay put so a review deploy is reachable. */
export const REDIRECT_HOSTS = ["www.chxgoose.com", "chxgoose.vercel.app"] as const;

export function hostRedirects() {
  return REDIRECT_HOSTS.map((host) => ({
    source: "/:path*",
    has: [{ type: "host" as const, value: host }],
    destination: `https://${CANONICAL_HOST}/:path*`,
    permanent: true as const,
  }));
}
