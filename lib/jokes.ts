import { dayOfYear, raceDate } from "./detroit";
import { readMeta, writeMeta } from "./db";

export const JOKES = [
  "I told my suitcase there would be no more trips. Now we’re on a break.",
  "I used to be addicted to soap, but I’m clean now.",
  "I asked the librarian if they had any books on paranoia. She whispered, they’re behind you.",
  "I told a chemistry joke. There was no reaction.",
  "I named my dog Five Miles so I can say I walk Five Miles every day.",
  "The rotation of the earth really makes my day.",
  "I have a joke about construction, but I’m still working on it.",
  "I tried to catch fog yesterday. Mist.",
  "I used to play piano by ear. Now I use my hands.",
  "Parallel lines have so much in common. It’s a shame they’ll never meet.",
  "I told my wife she drew her eyebrows too high. She looked surprised.",
  "I would tell you a joke about pizza, but it’s too cheesy.",
  "What do you call a fake noodle? An impasta.",
  "I only know 25 letters of the alphabet. I don’t know y.",
  "I used to hate facial hair, but then it grew on me.",
  "I have a fear of elevators, but I’m taking steps to avoid it.",
  "The shovel was a groundbreaking invention.",
  "I wondered why the baseball was getting bigger. Then it hit me.",
  "I stayed up all night to see where the sun went. Then it dawned on me.",
  "I lost my job at the bank on my first day. An old lady asked me to check her balance, so I pushed her over.",
  "I’m reading a book about anti-gravity. It’s impossible to put down.",
  "I used to be a baker, but I couldn’t make enough dough.",
  "The calendar’s days are numbered.",
  "I told my computer I needed a break, and it said no problem — it would go to sleep.",
  "I have a joke about time travel, but you didn’t like it.",
  "I bought some shoes from a drug dealer. I don’t know what he laced them with, but I’ve been tripping all day.",
  "A termite walks into a bar and asks, is the bar tender here?",
  "I threw a boomerang a few years ago. I now live in constant fear.",
  "My boss told me to have a good day, so I went home.",
  "I have a joke about unemployment, but none of the punchlines work.",
  "I asked my dog what’s two minus two. He said nothing.",
  "I was going to make a joke about sodium, but Na.",
  "The scarecrow won an award because he was outstanding in his field.",
  "I told a joke about a roof. It went over your head.",
  "I have a lot of jokes about unemployed people, but none of them work.",
];

export function jokeOfTheDay(now: Date = new Date()): string {
  const i = dayOfYear(now) % JOKES.length;
  return JOKES[i];
}

function cleanJoke(text: string): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length < 12 || t.length > 280) return null;
  const lower = t.toLowerCase();
  if (/(nsfw|kill yourself|rape|nazi)/.test(lower)) return null;
  return t;
}

export function formatFetchedJoke(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.joke === "string") return cleanJoke(d.joke);
  if (typeof d.setup === "string" && typeof d.punchline === "string") {
    return cleanJoke(`${d.setup} ${d.punchline}`);
  }
  if (typeof d.setup === "string" && typeof d.delivery === "string") {
    return cleanJoke(`${d.setup} ${d.delivery}`);
  }
  return null;
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(3500),
  });
  if (!res.ok) throw new Error(`joke http ${res.status}`);
  return res.json();
}

export async function fetchFreshJoke(): Promise<string | null> {
  const attempts: Array<() => Promise<string | null>> = [
    async () =>
      formatFetchedJoke(
        await getJson("https://official-joke-api.appspot.com/random_joke"),
      ),
    async () =>
      formatFetchedJoke(
        await getJson(
          "https://v2.jokeapi.dev/joke/Pun,Miscellaneous?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&safe-mode",
        ),
      ),
    async () =>
      formatFetchedJoke(
        await getJson("https://icanhazdadjoke.com/", {
          Accept: "application/json",
          "User-Agent": "chxgoose.com (Billie the porch goose)",
        }),
      ),
  ];
  for (const attempt of attempts) {
    try {
      const joke = await attempt();
      if (joke) return joke;
    } catch {
      /* try the next source */
    }
  }
  return null;
}

export async function dailyJoke(now: Date = new Date()): Promise<string> {
  const today = raceDate(now);
  const cachedDate = await readMeta("joke_date");
  const cachedText = await readMeta("joke_text");
  if (cachedDate === today && cachedText && cachedText.length > 10) {
    return cachedText;
  }
  const fresh = (await fetchFreshJoke()) ?? jokeOfTheDay(now);
  await writeMeta("joke_date", today);
  await writeMeta("joke_text", fresh);
  return fresh;
}
