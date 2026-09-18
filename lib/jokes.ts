import { dayOfYear } from "./detroit";

export const JOKES = [
  "Why did Billie stand on the porch all summer? She was outstanding in her field. Wait—that's a cow. She was outstanding on the stoop.",
  "A tourist asked if Billie bites. She said no, but her wardrobe might.",
  "Billie's therapist told her to spread her wings. She bought a bigger doormat.",
  "Knock knock. Who's there? Billie. Billie who? Billie the porch goose. You found her!",
  "Billie doesn't migrate. The outfits do, in little brown boxes.",
  "What's Billie's favorite board game? Goose, Goose, Wait That's Me.",
  "She applied to be a greeter. Her only reference was the mailbox.",
  "Why don't porch geese ever get lost? They never leave the porch.",
  "Billie told a knock-knock joke. Nobody knocked. She lives on a porch.",
  "A seagull heckled her. Billie billed him.",
  "What's a porch goose's workout? Heavy lifting of other people's vibes.",
  "Billie isn't stuck. She's committed.",
  "Why was Billie so calm in traffic? She wasn't in it. Porch.",
  "Her autobiography: Still Here, Still Goose.",
  "What do you call Billie in a tuxedo? The Honkfather. We haven't ordered that yet.",
  "Billie tried fishing. The fish filed a noise complaint.",
  "Why did the tourist scan the QR? Because the goose looked employed.",
  "Billie's love language is standing there.",
  "She doesn't ghost people. She porches them.",
  "What's her skincare? Morning dew and secondhand sunscreen.",
  "Billie voted for more snacks. The motion honked.",
  "Why is she bad at hide and seek? The porch is not a hiding place.",
  "Her horoscope said travel. She rotated fifteen degrees.",
  "A boat honked at Billie. Professional courtesy.",
  "She keeps a gratitude journal. Page one: porch. Page two: also porch.",
  "What did Billie say to the snow? I have a suit for that. Chip in.",
  "Why did she join the band? She already had the honk section covered.",
  "Billie's emergency contact is whoever walked by last. That's you.",
  "A maple leaf landed on her. She called it fall fashion.",
  "She doesn't chase bread. Bread chases her. She's that kind of goose.",
  "What's a porch goose's favorite app? Maps. She likes watching other people move.",
  "New Year's resolution: stand, but with intention.",
  "Why did Billie refuse to migrate? 905 Bridge has better lighting.",
  "She's plastic. The bit is real.",
  "If you lived here you'd be dressed too.",
];

export function jokeOfTheDay(now: Date = new Date()): string {
  const i = dayOfYear(now) % JOKES.length;
  return JOKES[i];
}
