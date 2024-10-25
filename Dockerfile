FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install deps into tmp dir
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb docker.env /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install without dev deps
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
COPY .husky/ /temp/prod/.husky/
RUN bun install husky -g
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
FROM base AS prerelase
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/docker.env .env
COPY . .

ENV NODE_ENV production

RUN bun migrate:deploy 

RUN bun run build

# Copy production deps
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelase /usr/src/app/dist dist
COPY --from=prerelase /usr/src/app/prisma prisma
COPY --from=prerelase /usr/src/app/.husky ./.husky
COPY --from=prerelase /usr/src/app/.env ./.env
COPY --from=prerelase /usr/src/app/package*.json ./

CMD [ "bun", "dist/main.js" ]