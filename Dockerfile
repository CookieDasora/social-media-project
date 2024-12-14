FROM oven/bun:1 AS base
WORKDIR /usr/src/app

ENV NODE_ENV=production

FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Production dependecies
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/

# Stupid thing that doesn't allow the build to proceed
COPY .husky/ /temp/prod/.husky/
RUN bun install husky -g

RUN cd /temp/prod && bun install --frozen-lockfile --production

# Preparing code
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bunx prisma generate
RUN bun run build

# Final image
FROM base AS release

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist dist
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/prisma prisma
COPY --from=prerelease /usr/src/app/.husky .husky

EXPOSE 8080/tcp
ENTRYPOINT ["bun", "dist/main.js"]
