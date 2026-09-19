const BANNED = [
  "nigger",
  "nigga",
  "negro",
  "kike",
  "spic",
  "wetback",
  "chink",
  "gook",
  "paki",
  "cracker",
  "honky",
  "redskin",
  "beaner",
  "raghead",
  "towelhead",
  "tranny",
  "shemale",
  "faggot",
  "fag",
  "dyke",
  "homo",
  "retard",
  "retarded",
  "spaz",
  "cripple",
  "mongoloid",
  "whore",
  "slut",
  "cunt",
  "bitch",
  "bastard",
  "asshole",
  "dickhead",
  "motherfucker",
  "fucker",
  "fuck",
  "fucking",
  "shithead",
  "dumbass",
  "jackass",
  "piss off",
  "go kill",
  "kys",
];

function foldToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i")
    .replace(/[^a-z]/g, "");
}

function stars(len: number): string {
  return "•".repeat(Math.max(3, Math.min(12, len)));
}

export function censorText(input: string): string {
  if (!input) return input;
  const parts = input.split(/(\s+)/);
  return parts
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      const folded = foldToken(part);
      if (!folded) return part;
      if (BANNED.includes(folded)) return stars(part.length);
      return part;
    })
    .join("")
    .replace(/\bpiss off\b/gi, stars(8))
    .replace(/\bgo kill\b/gi, stars(7));
}

export function isMostlyCensored(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  return letters.length < 2;
}
