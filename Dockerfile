# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.19.1

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# copy the app, note .dockerignore
COPY package.json .
COPY package-lock.json .
RUN npm ci

FROM dependency-base AS production-base

ARG ORIGIN
ENV ORIGIN=${ORIGIN}

# build will also take care of building
# if necessary
COPY . .
RUN npm run build

FROM $NODE_VERSION AS production

COPY --from=production-base /app/.output /app/.output

# Service hostname
ENV NUXT_HOST=0.0.0.0

# Service version
ARG NUXT_APP_VERSION
ENV NUXT_APP_VERSION=${NUXT_APP_VERSION}

# Run in production mode
ENV NODE_ENV=production

COPY ./start.sh /app

# start the app
CMD [ "node", "/app/.output/server/index.mjs" ]
