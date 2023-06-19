# lemmy-helper

Lemmy social media, federated application

This is an attempt to create a SvelteKit webapp for server operators to work directly with the PostgreSQL database tables. Work in progress / unstable project. Quick and dirty, proof of concept.

# Discussion

Lemmy social media community for this project: https://lemmy.ml/c/lemmy_helper

# Intended to be safe way to operate a server

It does read-only operations of the Lemmy database.

# Download code and build project

You will need NodeJS installed on your system. I used pnpm to do the project creation and install, you can likely use normal npm or yarn (untested). To build project:

```
git clone https://github.com/RocketDerp/lemmy_helper.git
cd lemmy_helper
pnpm install
```

# PostgreSQL username and password

PGUSER and PGPASSWORD environment variables are utilized by the NodeJS pg library used in the app. You can temporarily set these variables before the `npm run` command (example uses pnpm):

`PGUSER=lemmy PGPASSWORD=mypassword pnpm run dev --host --port 9000`


# sample nginx.confg

A sample nginx.config file is here on this project root. It uses a different hostname to route access to the admin.

1. You need to add a new CNAME alias to your DNS, such as lemmyadmin.example.com
2. You will need to change "example.com" in the nginx.conf file to your Internet domain mame. Put the file in /etc/nginx/sites-enabled/lemmy_helper.conf
3. generate the certifiate for your new hostname with Linux shell command: `certbot certonly --nginx`
4. run this application on port 9000.
5. restart nginx

NOTE: there is no login or password on this site, it does mostly safe read-only queries, although resetting the pg_stats is one write-operation.
