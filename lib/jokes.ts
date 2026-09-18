import { dayOfYear } from "./detroit";

export const JOKES = [
  "Why did Billy stand on the porch all day? He was outstanding in his field. Wait — that's a cow. He was outstanding on the stoop.",
  "Billy's therapist told him to spread his wings. He bought a bigger doormat.",
  "A tourist asked if Billy bites. Billy said no, but he honks up.",
  "Billy's favorite board game is Goose, Goose, Wait That's Me.",
  "Why don't porch geese ever get lost? They leave a trail of corn.",
  "Billy applied for a job as a greeter. His only reference was the mailbox.",
  "What's Billy's workout? Heavy lifting of other people's vibes.",
  "Billy told a knock-knock joke. Nobody knocked. He lives on a porch.",
  "Why did Billy wear a rain hat? Because weather or not, honk happens.",
  "Billy's favorite lake activity is judging your kayak from the steps.",
  "A fudge shop offered Billy a sample. He asked if they had corn flavor.",
  "Billy doesn't do yoga. He does downward-honk.",
  "Why was Billy so calm in traffic? He wasn't in it. Porch.",
  "Billy's autobiography: Still Here, Still Goose.",
  "What do you call Billy in a tuxedo? The Honkfather.",
  "Billy tried fishing. The fish filed a noise complaint.",
  "Why did the tourist scan Billy's QR? Because the goose looked employed.",
  "Billy's love language is standing there.",
  "A seagull heckled Billy. Billy billed him.",
  "Billy doesn't ghost people. He porch-es them.",
  "What's Billy's skincare? Morning dew and secondhand sunscreen.",
  "Billy voted for more snacks. The motion honked.",
  "Why is Billy bad at hide and seek? The porch is not a hiding place.",
  "Billy's horoscope said 'travel.' He rotated 15 degrees.",
  "A boat honked at Billy. Professional courtesy.",
  "Billy keeps a gratitude journal. Page one: porch. Page two: also porch.",
  "What did Billy say to the snow? 'I have a suit for that.'",
  "Billy isn't fat. He's wearing yesterday's corn.",
  "Why did Billy join the band? He already had the honk section.",
  "Billy's emergency contact is whoever walked by last.",
  "A maple leaf landed on Billy. He called it fall fashion.",
  "Billy doesn't chase bread. Bread chases Billy. He's that kind of goose.",
  "What's a porch goose's favorite app? Maps. He likes watching other people move.",
  "Billy's New Year's resolution: stand, but with intention.",
  "Why did Billy refuse to migrate? 905 Bridge has better lighting.",
];

export function jokeOfTheDay(now: Date = new Date()): string {
  const i = dayOfYear(now) % JOKES.length;
  return JOKES[i];
}
