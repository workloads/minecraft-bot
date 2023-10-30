# This is a minimal Dockerfile to create a container image for `minecraft-bot`.
# For a more extensive example, see https://github.com/workloads/container-images.

# see https://hub.docker.com/_/node/tags?page=1&name=18-bookworm-slim&ordering=name
# and https://docs.docker.com/engine/reference/builder/#from
FROM node:18-bookworm-slim

# see https://docs.docker.com/engine/reference/builder/#workdir
WORKDIR /srv

# see https://docs.docker.com/engine/reference/builder/#copy
COPY ./ /srv

# see https://docs.docker.com/engine/reference/builder/#entrypoint
ENTRYPOINT [ "/usr/local/bin/node", "dist/index.js" ]
