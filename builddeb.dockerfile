ARG VERSION
FROM pyrometer:$VERSION as pyrometer

FROM ubuntu
ARG VERSION
ENV BUILDDIR /build/pyrometer-$VERSION
ENV APPDIR /opt/pyrometer
WORKDIR $BUILDDIR
RUN mkdir -p opt/pyrometer && mkdir -p usr/bin
COPY --from=pyrometer $APPDIR/dist ./$APPDIR/dist
COPY --from=pyrometer $APPDIR/node_modules ./$APPDIR/node_modules
COPY --from=pyrometer /usr/bin/pyrometer ./usr/bin/
COPY backend/DEBIAN DEBIAN
RUN sed -i "s/@VERSION@/$VERSION/g" ./DEBIAN/control
RUN chmod 775 ./DEBIAN/postinst
RUN dpkg-deb --build $BUILDDIR
