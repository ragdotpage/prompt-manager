<div align="center">

  <img src="./.github/banner-dark.png#gh-dark-mode-only" />
  <img src="./.github/banner.png#gh-light-mode-only" />

<br />

<!--
 *                            _ _
 *    ░▒▓█████▓▒░     ___ ___| | | __ _
 *    ░▒▓█   █▓▒░    / __/ _ \ | |/ _` |
 *    ░▒▓█   █▓▒░   | (_|  __/ | | (_| |
 *    ░▒▓█████▓▒░    \___\___|_|_|\__,_|                            
 *
 -->


<p>
	<h1><b>Cella</b></h1>
<p>
    <b>Single stack TypeScript template to build local-first SaaS.</b>
    <br />
    <br />
    <a href="https://cellajs.com">Website</a>
    ·
    prerelease version
    ·
    MIT license
  </p>
  <br />
  <br />
</p>

</div>

#### Prerelease

> ❗ Please be aware this is a prerelease. It does not meet production requirements yet and large breaking changes still occur regularly. Want to contribute? Let's connect! ✉️ <info@cellajs.com>


#### Contents
- [Installation](#installation)
- [Architecture](/info/ARCHITECTURE.md)
- [Roadmap](/info/ROADMAP.md)
- [Deployment](/info/DEPLOYMENT.md)

## Installation

#### Prerequisites
- **Node:** Check node with `node -v`. Install Node 20.x or 22.x with (recommended) [Volta](https://docs.volta.sh/guide/).
- **Docker:** Install [Orbstack](https://orbstack.dev/) or [Docker](https://docs.docker.com/get-docker/)

### Step 1

#### Clone

```bash
git clone git@github.com:cellajs/cella.git && cd cella
```

#### Env

Create a .env in `env` folder with `.env.example`. Minimum is the `DATABASE_URL`.

#### Install
```bash
pnpm install
```

#### Docker
Make sure docker runs in the background.

```bash
pnpm run docker
```

### Step 2

#### Populate database
When starting from scratch: generate migration and build the db tables.

```bash
pnpm run generate
pnpm run migrate 
```

And for local-first data with [ElectricSQL](https://github.com/electric-sql/electric) in frontend.

```bash
pnpm run electrify
```

#### Run

Check it out at [localhost:3000](http://localhost:3000)

```bash
pnpm run dev
```

### Step 3

The users [seed](/backend/seed/index.ts) is required to add an ADMIN user. There is also an optional seed to add more data with [faker.js](https://github.com/faker-js/faker).

```bash
pnpm run seed:users
pnpm run seed:organizations
```

Use [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) to manage your local db on [local.drizzle.studio](http:local.drizzle.studio)

```bash
pnpm run studio
```

### API documentation
Cella has autogenerated [API docs](https://cellajs.com/api/v1/docs) at [localhost:4000/docs](http://localhost:4000/docs)


### More info
- Cella uses [Biome](https://biomejs.dev/). Please [install it](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for a correct code style. For manual lint fixing run `pnpm run check:fix` for type errors `pnpm run check:types`
- EADDRINUSE errors? Try `sudo lsof -i :1080 -i :3000 -i :4000` and then `kill -9 *PID*` with a space-separated list of `PID`
- pnpm cache issues? Try `pnpm store prune`
- turbo cache issues? Try adding `--force` to the command
- docker cache issues? Try `docker builder prune --force`

<br />
<br />

💙💛 Big thank you too [drizzle-orm](https://github.com/drizzle-team/drizzle-orm), [hono](https://github.com/honojs/hono), [tanstack-router](https://github.com/tanstack/router), [electric-sql](https://github.com/electric-sql/electric) & [shadcn](https://github.com/shadcn-ui/ui).
