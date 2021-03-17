FROM node:14.15.3-alpine@sha256:b2da3316acdc2bec442190a1fe10dc094e7ba4121d029cb32075ff59bb27390a

RUN apk --no-cache add python make g++
RUN apk add dumb-init

# Create app directory
ENV HOME /usr/src/app
ENV NODE_ENV production
WORKDIR $HOME

COPY backend/package.json backend/yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --chown=node:node backend/ ./

RUN yarn build

USER node
ENTRYPOINT ["dumb-init", "node", "dist/index.js"]
