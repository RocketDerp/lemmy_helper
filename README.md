# lemmy-helper

For server operators of Lemmy social media, federated application

This is an attempt to create a SvelteKit webapp for server operators to work directly with the PostgreSQL database tables. Work in progress / unstable project. Quick and dirty, proof of concept. NEW: command line interface (CLI) for crawling and testing Lemmy servers.

# Discussion

Lemmy social media community for this project: https://lemmy.ml/c/lemmy_helper  
NOTE: July 1 I opened GitHub Discussions https://github.com/RocketDerp/lemmy_helper/discussions - because every major Lemmy server is unsable. I suggest server operators meet here to discuss emergency changes. Thank you.

# Intended to be safe way to operate a server

It does read-only operations of the Lemmy database. WARNING: it does expose some raw data from your PostgreSQL database to the web. Out of the box, it won't be accessible from nginx or other proxy unless you set those up. And if you do open it to the public Internet, you can password protect the webapp.

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

# Run via Docker Compose

A `docker-compose.yml` is also included, and can be used to connect to dockerized Lemmy installations. Note that in order to do this, you'll either need to make sure that your PostgreSQL container either has the `5432` port exposed (preferably to only `127.0.0.1`), or both containers will need to be on the same docker network (this can be done by copying the `app` service to your Lemmy installation's `docker-compose.yml` file).

Then, make sure to copy `.env.example` to `.env` and modify the new file to include your Lemmy installation's PostgreSQL credentials. Additionally, you'll need to make sure `PGHOST` is set properly, it should be either the IP/hostname of the system running the PostgreSQL database, or if connecting over the docker network it should be the name of your PostgreSQL container (by default this is `postgres`).

After this, you should then be able to run `docker compose up` to bring the application online, and it will be available on port `9000`.

# sample nginx.confg

A sample nginx.config file is here on this project root. It uses a different hostname to route access to the admin.

1. You need to add a new CNAME alias to your DNS, such as lemmyadmin.example.com
2. You will need to change "example.com" in the nginx.conf file to your Internet domain mame. Put the file in /etc/nginx/sites-enabled/lemmy_helper.conf
3. generate the certifiate for your new hostname with Linux shell command: `certbot certonly --nginx`
4. run this application on port 9000.
5. restart nginx

NOTE: there is no login or password on this site, it does mostly safe read-only queries, although resetting the pg_stats is one write-operation.

If you want to add a password to restrict access, something like this should work: https://siddharthac6.medium.com/nginx-implementing-basic-authentication-ecc1100c3a3c


# Command line interface

There is a command line interface for running from a shell. Right now it has some primitive crawling of Lemmy servers. Experimental, work in progress.

`node lemmyhelper_commandline.js posts`

# Project ToDo

If someone wants to convert the .js to TypeScript files, fine with me. The CLI may then need to have a compile step added? It takes a lot of time to tweak the code and study how lemmy_server behaves, especially with the overloaded servers in the 0.18.0 era. So throwing code around with .js just works faster for me while I'm experimenting. Open an issue or post in the Lemmy community if you want to take that on so I know not to edit those files until converted. If you haven't noticed, I've been using GitHub to upload test code to my live Lemmy server, that is why there are so many commits. Thank you.
