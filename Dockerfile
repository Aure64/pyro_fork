FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY backend/package.json backend/yarn.lock ./
#install runtime dependencies and populate yarn cache
RUN yarn install --frozen-lockfile --production=true

FROM builder as app-builder
RUN yarn install --frozen-lockfile
COPY --chown=node:node backend/ ./
RUN yarn build

FROM node:16-alpine
ENV NODE_ENV production
ENV APP_DIR /opt/pyrometer
ENV RUN_SCRIPT /usr/bin/pyrometer
WORKDIR $APP_DIR
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=app-builder /usr/src/app/dist dist

RUN echo -e "#!/usr/bin/env node\n\
'use strict';\n\
require('$APP_DIR/dist/index');\n" \
    >> $RUN_SCRIPT
RUN chmod +x $RUN_SCRIPT
USER node
ENTRYPOINT [$RUN_SCRIPT]
