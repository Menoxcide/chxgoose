# chxgoose.com — Silly Billy

Porch goose at 905 Bridge. QR landing: daily joke, dollar-vote outfits, flock map.

Spec: `docs/superpowers/specs/2026-09-18-chxgoose-porch-design.md`

## Env

Copy `.env.example`. Need `DATABASE_URL` (Neon) and Stripe keys for live honks. Without them the page still renders Billy + the joke.

Owner stamp (optional):

```
curl -X POST https://chxgoose.com/api/dressed -H "x-owner-key: $OWNER_KEY"
```
