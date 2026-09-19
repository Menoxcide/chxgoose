import { dayOfYear, raceDate } from "./detroit";
import { readMeta, writeMeta } from "./db";

export type JokeKind = "dad" | "mom";

export const DAD_JOKES = [
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "I used to be addicted to soap, but I'm clean now.",
  "I asked the librarian if they had books on paranoia. She whispered, they're behind you.",
  "I told a chemistry joke. There was no reaction.",
  "I named my dog Five Miles so I can say I walk Five Miles every day.",
  "The rotation of the earth really makes my day.",
  "I have a joke about construction, but I'm still working on it.",
  "I tried to catch fog yesterday. Mist.",
  "Parallel lines have so much in common. It's a shame they'll never meet.",
  "I told my wife she drew her eyebrows too high. She looked surprised.",
  "What do you call a fake noodle? An impasta.",
  "I only know 25 letters of the alphabet. I don't know y.",
  "I used to hate facial hair, but then it grew on me.",
  "The shovel was a groundbreaking invention.",
  "I wondered why the baseball was getting bigger. Then it hit me.",
  "I stayed up all night to see where the sun went. Then it dawned on me.",
  "I used to be a baker, but I couldn't make enough dough.",
  "The calendar's days are numbered.",
  "I have a joke about time travel, but you didn't like it.",
  "A termite walks into a bar and asks, is the bar tender here?",
  "I asked my dog what's two minus two. He said nothing.",
  "I was going to make a joke about sodium, but Na.",
  "The scarecrow won an award because he was outstanding in his field.",
  "I told a joke about a roof. It went over your head.",
  "Why don't eggs tell jokes? They'd crack each other up.",
  "What do you call cheese that isn't yours? Nacho cheese.",
  "How does a penguin build a house? Igloos it together.",
  "Why did the bicycle fall over? It was two tired.",
  "What do you call a bear with no teeth? A gummy bear.",
  "Why did the golfer bring two pairs of pants? In case he got a hole in one.",
  "I used to play piano by ear. Now I use my hands.",
];

export const MOM_JOKES = [
  "Mom always said, \"If all your friends jumped off a bridge…\" I told her that's why I pick short friends.",
  "I asked Mom if I could leave the table. She said, \"I don't know, can you?\"",
  "Mom's favorite pickup line: I carried you nine months. Take out the trash.",
  "Why did Mom go to the bakery? She kneaded the dough.",
  "Mom said money doesn't grow on trees. Then she named me after a fruit.",
  "I told Mom I was running away. She packed me a sandwich and said, \"Don't forget a sweater. I'm cold.\"",
  "Mom's car lecture has three settings: Don't make me turn around, because I said so, and wait till your father hears.",
  "What did Mom say to the bread? I loaf you.",
  "Mom: Were you born in a barn? Me: You were there. You tell me.",
  "I asked Mom what's for dinner. She said, \"Food.\" I asked what kind. She said, \"The kind you eat.\"",
  "Mom doesn't sleep. She rests her eyes at 40 miles an hour in the school pickup line.",
  "Why don't moms ever get lost? The guilt always leads them home.",
  "Mom said, \"Look at me when I'm talking to you.\" I did. She said, \"Don't you give me that look.\"",
  "I kept making a face. Mom said it would freeze that way. I now have a career in ice sculpture.",
  "Mom's GPS is just her yelling \"I told you to turn back there\" in 4K.",
  "What do you call a mom who can't find her glasses? The person wearing her glasses.",
  "Mom: We have food at home. The food: a mustard packet and hope.",
  "I told Mom I was hungry. She said, \"Hi Hungry, I'm Mom.\" I moved out. She packed a snack.",
  "Why did the mom sit on the clock? She wanted to be on time for once — for my recital in 2009.",
  "Mom's love language is sneaking leftovers into a Tupperware you didn't ask for.",
  "If Mom says \"that's nice\" while looking at her phone, the conversation is over.",
  "Mom: Don't sit so close to the TV. Also Mom: watches a 6-inch phone like it's a campfire.",
  "I asked Mom if I was her favorite. She said, \"I love you all the same.\" Then she winked at the dog.",
  "Mom jokes aren't jokes. They're warnings with a rimshot.",
  "What did Mom pack for the road trip? Snacks, wipes, and a speech about not making her pull over.",
  "Mom said, \"You'll miss this when you're older.\" I miss the snacks. She was right.",
  "A mom walks into a room and the room sits up straighter.",
  "Mom's favorite recipe: whatever's in the fridge, plus \"you'll eat it.\"",
  "Why did Mom bring a ladder to the bar? She heard the drinks were on the house. Then she made me a sandwich.",
  "I said I was bored. Mom listed 40 chores. I was no longer bored. I was hiding.",
  "Mom: Because I said so. The Supreme Court has never reversed her.",
];

export const JOKES = DAD_JOKES;

export function jokeKindFor(now: Date = new Date()): JokeKind {
  return dayOfYear(now) % 2 === 0 ? "dad" : "mom";
}

export function jokeOfTheDay(now: Date = new Date()): string {
  const kind = jokeKindFor(now);
  const list = kind === "dad" ? DAD_JOKES : MOM_JOKES;
  return list[dayOfYear(now) % list.length];
}

function cleanJoke(text: string): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length < 12 || t.length > 280) return null;
  const lower = t.toLowerCase();
  if (/(nsfw|kill yourself|rape|nazi|drug dealer)/.test(lower)) return null;
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

export async function fetchDadJoke(): Promise<string | null> {
  const attempts: Array<() => Promise<string | null>> = [
    async () =>
      formatFetchedJoke(
        await getJson("https://icanhazdadjoke.com/", {
          Accept: "application/json",
          "User-Agent": "chxgoose.com (Billie the porch goose)",
        }),
      ),
    async () => formatFetchedJoke(await getJson("https://dadjokes.bamboozledaardvark.com/api/jokes/random")),
  ];
  for (const attempt of attempts) {
    try {
      const joke = await attempt();
      if (joke) return joke;
    } catch {
      /* next source */
    }
  }
  return null;
}

export async function dailyJoke(
  now: Date = new Date(),
): Promise<{ text: string; kind: JokeKind }> {
  const today = raceDate(now);
  const kind = jokeKindFor(now);
  const cachedDate = await readMeta("joke_date");
  const cachedText = await readMeta("joke_text");
  const cachedKind = await readMeta("joke_kind");
  if (cachedDate === today && cachedText && cachedText.length > 10 && cachedKind === kind) {
    return { text: cachedText, kind };
  }
  const fresh =
    kind === "dad" ? ((await fetchDadJoke()) ?? jokeOfTheDay(now)) : jokeOfTheDay(now);
  await writeMeta("joke_date", today);
  await writeMeta("joke_text", fresh);
  await writeMeta("joke_kind", kind);
  return { text: fresh, kind };
}
