FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install yt-dlp and ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install --break-system-packages yt-dlp && \
    mkdir -p /root/.config/yt-dlp && \
    echo "--js-runtimes node" > /root/.config/yt-dlp/config

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/.output ./.output
RUN mkdir -p /app/downloads && \
    mkdir -p /app/output && \
    chown -R 1000:1000 /app

USER 1000

ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
