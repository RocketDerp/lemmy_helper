FROM node:20

WORKDIR /app

COPY . /app

RUN curl -L https://pnpm.js.org/pnpm.js | node - add --prefix=.pnpm --global pnpm

RUN .pnpm/bin/pnpm install

EXPOSE 9000
