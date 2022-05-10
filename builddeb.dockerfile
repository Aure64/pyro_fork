ARG VERSION
FROM pyrometer:$VERSION as pyrometer

#22.04 (jammy) produces .deb compressed with Zstd
#that can't be installed in RaspberryPi Debian
#and dpkg-buildpackage appears to ignore -Z option
FROM ubuntu:20.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt update -y
RUN apt install -y dpkg-dev debhelper
ARG VERSION
ENV BUILDDIR /build/pyrometer-$VERSION
ENV APPDIR /opt/pyrometer
WORKDIR $BUILDDIR

COPY --from=pyrometer $APPDIR/node_modules node_modules
COPY --from=pyrometer /usr/bin/pyrometer .
COPY --from=pyrometer $APPDIR/dist dist
COPY --from=pyrometer $APPDIR/package.json .
COPY --from=pyrometer $APPDIR/ui ui

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
