FROM node:14-alpine as builder
WORKDIR /usr/src/app
COPY backend/package.json backend/yarn.lock ./
#install runtime dependencies and populate yarn cache
RUN yarn install --frozen-lockfile --production=true

FROM builder as app-builder
RUN yarn install --frozen-lockfile
COPY --chown=node:node backend/ ./
RUN yarn build

FROM node:14-alpine
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=app-builder /usr/src/app/dist dist
USER node
ENTRYPOINT ["node", "dist/index.js"]
