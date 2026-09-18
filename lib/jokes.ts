import { dayOfYear } from "./detroit";

export const JOKES = [
  "She’s plastic. The outfits are real.",
  "Billie doesn’t migrate. Packages do.",
  "905 Bridge. She’s the one in clothes.",
  "Not a pet. A porch fixture.",
  "Amazon proposes. Billie wears it.",
  "Hollow on the inside. Booked on the outside.",
  "She’ll wear whatever wins. That’s the job.",
  "The QR is the whole conversation.",
  "Outfits arrive in a box. She does not.",
  "Stand here long enough and people vote.",
  "Michigan vacation. Permanent goose.",
  "No feathers were involved.",
  "She’s been here longer than your tan.",
  "Please do not steal the goose. Steal the look.",
  "Rain, snow, or Tigers cap.",
  "She doesn’t honk. You do.",
  "A lawn ornament with a wardrobe budget.",
  "If it’s on her, somebody paid.",
  "She faces the street. That’s the gig.",
  "Tomorrow’s outfit is currently for sale.",
  "Plastic lasts. Trends do not. We order anyway.",
  "This is not a wildlife encounter.",
  "She has more outfits than most of us packed.",
  "The porch is the runway.",
  "Scan, chip in, walk on. She’s not going anywhere.",
  "No corn. No pond. Just clothes.",
  "Billie: one goose, many SKUs.",
  "If you lived here you’d be dressed too.",
  "Highest bid wears it. Democracy, sort of.",
  "She’s the landmark. You’re the funding.",
  "Same goose. New box. Every time.",
  "People used to wave. Now they vote.",
  "She doesn’t need water. She needs a tracking number.",
];

export function jokeOfTheDay(now: Date = new Date()): string {
  const i = dayOfYear(now) % JOKES.length;
  return JOKES[i];
}
