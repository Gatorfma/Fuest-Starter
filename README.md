# Fuest

## Packages

- [Next.js](https://nextjs.org) full-stack React framework.
  - File based routing `app/hello/page.tsx` -> `http://localhost:3000/hello`
  - Server endpoints `app/api/hello/route.tsx` -> `http://localhost:3000/api/hello`
  - Server Side Rendering (SSR) etc.
- [NextAuth.js][NextAuth.js], authentication framework for OAuth 2.0 flows.
- [Drizzle][Drizzle], TypeScript query builder and migration tool
- [Tailwind CSS](https://tailwindcss.com) only way to write CSS in a sane manner
- [tRPC](https://trpc.io) type-safe HTTP client adapter for calling server-side code
- [nix](https://nixos.org) fully reproducible development environments
- [ngrok](https://ngrok.com/) application tunnel, used to expose your local environment to internet over HTTPS

## Learning Resources

React with Next.js is one the defacto standard of web development here are the resources that I used to create this repo.

- Full end to end video of our stack [3 hours long video](https://www.youtube.com/watch?v=d5x0JCZbAJs)
- [React Query in 100 seconds by Fireship](https://www.youtube.com/watch?v=novnyCaa7To)
- [Why React Query?](https://www.youtube.com/watch?v=vxkbf5QMA2g)
- [Why React Query Won?](https://www.youtube.com/watch?v=xIflplz925Y)
- [tRPC and Next.js](https://www.youtube.com/watch?v=qCLV0Iaq9zU&t=82s)
- Tailwind is easy lol, here is the [docs](https://tailwindcss.com) again
- [NextAuth and Next.js](https://www.youtube.com/watch?v=md65iBX5Gxg)

## Getting Started

_Note: you can skip WSL and Nix if you can install correct version of Node.js and ngrok cli yourself._

1. Install WSL (Windows Subsystem for Linux) for Linux emulation on Windows
2. Install Nix using DetermineteSystems installer
3. Clone this repository `git clone ...`
4. Install required packages using `nix` by running `nix develop -c $SHELL`
5. Install Node.js dependencies using `pnpm i`

## Running Development Server

### Database Migrations

Database queries and tables are managed by [Drizzle][Drizzle] with SQLite database. [Package JSON](./package.json) has following scripts to migrate/update database.

|  script             | description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
|  `pnpm db:generate` | Generate migration SQL files                                            |
|  `pnpm db:migrate`  | Run migrations against current database                                 |
|  `pnpm db:push`     | Using schema _PUSH_ changes directly to database                        |
|  `pnpm db:studio`   | Runs database studio/inspector accessible via [browser][DrizzleStudio]  |

When getting started run `pnpm run db:push` to create the database, this command will create [`db.sqlite`](./db.sqlite) file with initial tables. Important files are [Drizzle configuration file](./drizzle.config.ts) and [database schema](./src/server/db/schema.ts).

### OAuth 2.0

Twitter and many other authentication providers are supported through [NextAuth.js][NextAuth.js]. Currently this application is configured to use Twitter authentication, setting it up requires creating a Twitter Develop account from [Twitter Developer Portal][Twitter Developer Portal].

1. First create a new application from [Projects and Apps](https://developer.twitter.com/en/portal/projects-and-apps).
2. Fill out the form using a `localhost` or a HTTP tunnel created by Ngrok (see Ngrok section). Website URL should match `NEXTAUTH_URL` variables set in [.env](./.env.example). Redirect URL should be `NEXTAUTH_URL/api/auth/callback/twitter`. If you are working locally then `NEXTAUTH_URL` and website URL (in Twitter API configuration) would be `http://localhost:3000` and redirect URL for Twitter app is `http://localhost:3000/api/auth/callback/twitter`.
3. Navigate to `http://localhost:3000` and follow sign-in to create the first user.

By end of this you should have filled these variables for `.env`

```
NEXTAUTH_URL="http://localhost:3000"
TWITTER_CLIENT_ID="*****"
TWITTER_CLIENT_SECRET="*****"
```

[NextAuth.js]: https://next-auth.js.org
[Twitter Developer Portal]: https://developer.x.com/en
[Drizzle]: https://orm.drizzle.team
[DrizzleStudio]: https://local.drizzle.studio/

### Ngrok

**What is a HTTPS tunnel?** A tunnel is a program running in your computer listening to requests that are replayed from a remote server such as publicly accessible endpoints by Ngrok and replays them in your local machine so you can expose services on your machine to internet without needing to setup DNS or IP/portforwarding.

Steps used to setup an Ngrok tunnel to access your development server from your phone. _This assumes that you have setup your environment correctly via Nix or manually_

1. Create a [Ngrok account](https://dashboard.ngrok.com/signup) and verify your email.
2. From [Getting Started section](https://dashboard.ngrok.com/get-started/your-authtoken) copy your authentication token and run `ngrok config add-authtoken $YOUR_AUTHTOKEN`.
   - This will authenticate `ngrok` CLI with your account
3. Run the local Next.js server via `pnpm dev`, this will run development server on port 3000 if you haven't customized it.
4. Run HTTPS tunnel via `ngrok http 3000`, this will create a secure tunnel from Nrgok to your machine and now you can visit the app from URL generated by Ngrok.
