# chxgoose.com — Billie

Plastic porch goose at 905 Bridge. Dollar-vote outfits ordered and put on her.

Drop a real porch photo at `public/billie.jpg` if you want it on the hero.

## Env

`.env.example`: `DATABASE_URL`, Stripe keys. Without them the page still renders; honks stay offline.

Owner stamp:

```
curl -X POST https://chxgoose.com/api/dressed -H "x-owner-key: $OWNER_KEY"
```
