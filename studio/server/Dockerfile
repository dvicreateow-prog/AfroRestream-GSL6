# Studio backend: Express + ws signalling + ffmpeg RTMP fan-out.
#
# Built from the workspace root (studio/) because server depends on the shared
# package. Build with:  docker build -f server/Dockerfile .

FROM node:22-bookworm-slim

# ffmpeg does the encoding and the multi-destination fan-out; without it the
# broadcast endpoints return a clear error instead of streaming.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Manifests first so dependency layers cache across code changes.
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# tsx is a runtime dependency, not tooling: the server imports .ts specifiers and
# the tsconfig is noEmit, so there is no compiled output to run with plain node.
RUN npm ci --omit=dev --workspace server --include-workspace-root

COPY shared ./shared
COPY server ./server

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Recordings are ephemeral on most PaaS disks; mount a volume to keep them.
RUN mkdir -p /app/server/recordings

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "--workspace", "server", "run", "start"]
