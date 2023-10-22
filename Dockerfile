# This is a minimal Dockerfile to create a container image for `minecraft-bot`.
# For a more extensive example, see https://github.com/workloads/container-images.

# see https://hub.docker.com/_/node/tags?page=1&name=21-bookworm-slim&ordering=name
FROM node:21-bookworm-slim

WORKDIR /srv

COPY ./ /srv

ENTRYPOINT [ "/usr/local/bin/node", "dist/index.js" ]
