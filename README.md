# Powerlifting Notebook

A powerlifter's notebook: OpenPowerlifting record on the home page, meet countdown and attempt planner, six-phase warm-ups with tick-off exercises and timers, technique cues, rehab work, a bodyweight tracker, and a daily-calories tracker. A native app for iPhone and Android, supporting the two latest OS versions (iOS 26+, Android 16+). Forked from Marc's personal powerlifting hub.

## Stack

- Expo (React Native) + Expo Router + TypeScript: run `npx expo start`, then open in Expo Go or press `w` for the browser
- Supabase: the app talks to it directly with `@supabase/supabase-js`; TanStack Query caches everything on the phone and queues edits made offline
- Drizzle owns the schema in `db/` (`npm run db:push` syncs it, `npm run db:sql` applies the functions and triggers in `db/sql/`, `npm run db:seed` adds dummy data)
- Accounts use Supabase Auth, which stores only salted bcrypt hashes of passwords. Usernames live in the `profiles` table, created at sign-up by a trigger
- Row-level security is on for every table: signed-out visitors can't read or write anything, and the app shows a log in prompt instead
- OpenPowerlifting record fetched on the phone from `openpowerlifting.org/api/liftercsv/<username>`, cached for a day
- `website/` is the static site for powerliftingnotebook.com (home page and privacy policy), served by a Cloudflare Worker (`wrangler.jsonc`) that redeploys from `main`
- Sign-up emails are sent through Resend from Supabase Auth; the branded templates in `supabase/templates/` are pasted into Supabase → Authentication → Emails

## Development principles

### Branches

- `main` always works. Nobody commits to it directly.
- Every change gets its own short-lived branch and reaches `main` through a pull request.
- No `develop` branch. With two of us it's an extra step for no gain.

### Branch names

| Prefix      | For                                           | Example                 |
| ----------- | --------------------------------------------- | ----------------------- |
| `feature/`  | New functionality                             | `feature/user-accounts` |
| `fix/`      | Bug fixes                                     | `fix/timer-reset`       |
| `refactor/` | Restructuring code without changing behaviour | `refactor/expo-app`     |
| `chore/`    | Tidy-ups, dependencies, config, docs          | `chore/update-readme`   |

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

- One change per pull request, so it's easier to review and easier to undo.
- Keep branches short-lived; merge little and often rather than one big branch at the end.
