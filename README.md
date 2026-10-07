# Clubs

Prototype site for Founders, Inc. Clubs. Static Next.js app. Content lives in `lib/clubs.ts`.

```bash
npm run dev
```

Add a club by appending one object to `clubs` and any dates to `eventSeeds`. Drop photos in `public` at the paths in that file. Missing images render a labeled placeholder.

Dates are computed in Pacific time from today, and pages revalidate hourly so the calendar doesn't go stale.
