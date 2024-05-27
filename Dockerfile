ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine as build
WORKDIR /opt

COPY . .
RUN yarn install --pure-lockfile
RUN yarn postinstall
RUN yarn build

FROM node:${NODE_VERSION}-alpine as runtime
WORKDIR /opt

RUN apk add --no-cache build-base git curl && npm install -g pm2

COPY --from=build /opt .
RUN yarn install --pure-lockfile
RUN yarn postinstall

EXPOSE 8081
ENV PORT 8081
ENV NODE_ENV production

CMD ["yarn", "start:prod"]