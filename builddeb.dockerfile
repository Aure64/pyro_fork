ARG VERSION
FROM pyrometer:$VERSION as pyrometer

FROM ubuntu
ENV DEBIAN_FRONTEND noninteractive
RUN apt update -y
RUN apt install -y dpkg-dev dh-systemd
ARG VERSION
ENV BUILDDIR /build/pyrometer-$VERSION
ENV APPDIR /opt/pyrometer
WORKDIR $BUILDDIR

COPY --from=pyrometer $APPDIR/node_modules node_modules
COPY --from=pyrometer /usr/bin/pyrometer .
COPY --from=pyrometer $APPDIR/dist dist
COPY --from=pyrometer $APPDIR/package.json .

RUN mkdir -p debian
WORKDIR $BUILDDIR/debian

COPY backend/debian/changelog .
COPY backend/debian/control .
COPY backend/debian/install .
COPY backend/debian/rules .
COPY backend/debian/pyrometer.postinst .
COPY backend/debian/source source
COPY backend/debian/compat .
COPY backend/systemd/pyrometer.service .
WORKDIR $BUILDDIR
RUN dpkg-buildpackage -b
