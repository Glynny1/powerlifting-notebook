# Powerlifting Notebook

A powerlifter's notebook: OpenPowerlifting record on the home page, meet countdown and attempt planner, six-phase warm-ups with tick-off exercises and timers, technique cues, rehab work, a bodyweight tracker, and a daily-calories tracker. Password-gated, mobile-first. Forked from Marc's personal powerlifting hub.

## Stack

- Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel
- Neon Postgres via Drizzle ORM (`npm run db:push` syncs the schema)
- One-password auth: signed session cookie, enforced for every route by `src/proxy.ts`
- OpenPowerlifting data fetched server-side from `openpowerlifting.org/api/liftercsv/<username>`, cached for a day

## Development principles

### Branches

- `main` always works. Nobody commits to it directly.
- Every change gets its own short-lived branch and reaches `main` through a pull request.
- No `develop` branch — with two of us it's an extra step for no gain.

### Branch names

| Prefix     | For                                   | Example                 |
| ---------- | ------------------------------------- | ----------------------- |
| `feature/` | New functionality                     | `feature/user-accounts` |
| `fix/`     | Bug fixes                             | `fix/timer-reset`       |
| `chore/`   | Tidy-ups, dependencies, config, docs  | `chore/update-readme`   |

Lowercase, words separated by hyphens.

### Everyday routine

```bash
git switch main
git pull                                  # start from the latest main
git switch -c feature/user-accounts       # new branch for this change

# ...make changes...
git add .
git commit -m "Add sign-up screen"
git push -u origin feature/user-accounts  # first push of the branch
```

Then open a pull request on GitHub, review it, and merge. Afterwards:

```bash
git switch main
git pull
git branch -d feature/user-accounts       # delete the local copy
```

### Keeping a branch up to date

If `main` has moved on while you're working, bring those changes into your branch:

```bash
git pull origin main
```

### Pull requests

- One change per pull request — easier to review and easier to undo.
- Keep branches short-lived; merge little and often rather than one big branch at the end.
