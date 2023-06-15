# lemmy-helper

Lemmy social media, federated application

This is an attempt to create a SvelteKit webapp for server operators to work directly with the PostgreSQL database tables. Work in progress / unstable project. Lemmy social media community for this project: https://lemmy.ml/c/lemmy_helper

# PostgreSQL username and password

PGUSER and PGPASSWORD enviornment variables are used by the NodeJS pg library used in the app. You can temporarily set these variables before the npm run command (exanple uses pnpm):

`PGUSER=lemmy PGPASSWORD=mypassword pnpm run dev --host --port 9000`


## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
