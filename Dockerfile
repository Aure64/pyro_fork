FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY backend/package.json backend/yarn.lock ./
RUN apk add --no-cache python3 make g++ git
#install runtime dependencies and populate yarn cache
RUN yarn install --frozen-lockfile --production=true

FROM builder as backend-build
RUN yarn install --frozen-lockfile
COPY --chown=node:node backend/ ./
RUN yarn build

FROM node:16-alpine as ui-builder
WORKDIR /usr/src/app
COPY --from=backend-build /usr/src/app/src/schema.graphql /usr/src/backend/src/schema.graphql
COPY ui/package.json ui/yarn.lock ./
RUN apk add --no-cache python3 make g++ git
#install runtime dependencies and populate yarn cache
RUN yarn install --frozen-lockfile --production=true

FROM ui-builder as ui-build
RUN yarn install --frozen-lockfile
COPY --chown=node:node ui/ ./
RUN yarn build


FROM node:16-alpine
ENV NODE_ENV production
ENV APP_DIR /opt/pyrometer
ENV RUN_SCRIPT /usr/bin/pyrometer
WORKDIR $APP_DIR
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=backend-build /usr/src/app/dist dist
COPY --from=backend-build /usr/src/app/package.json .
COPY --from=ui-build /usr/src/app/dist ui

RUN printf \
    "%s\n" "#!/usr/bin/env node" \
    "require('process').env.npm_package_version = require('$APP_DIR/package.json').version;" \
    "require('$APP_DIR')" > $RUN_SCRIPT

RUN chmod +x $RUN_SCRIPT
USER node

#can't use variable - exec form doesn't expand variable
ENTRYPOINT ["/usr/bin/pyrometer"]
