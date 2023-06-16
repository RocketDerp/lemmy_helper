# lemmy-helper

Lemmy social media, federated application

This is an attempt to create a SvelteKit webapp for server operators to work directly with the PostgreSQL database tables. Work in progress / unstable project.

Lemmy social media community for this project: https://lemmy.ml/c/lemmy_helper

# Download code and build project

You will need NodeJS installed on your system. I used pnpm to do the project creation and install, you can likely use normal npm or yarn (untested). To build project:

```
git clone https://github.com/RocketDerp/lemmy_helper.git
cd lemmy_helper
pnpm install
```

# PostgreSQL username and password

PGUSER and PGPASSWORD environment variables are used by the NodeJS pg library used in the app. You can temporarily set these variables before the npm run command (exanple uses pnpm):

`PGUSER=lemmy PGPASSWORD=mypassword pnpm run dev --host --port 9000`


