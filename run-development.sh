#!/usr/bin/env nix-shell
#! nix-shell -i bash -p python3 python3Packages.pip ffmpeg yt-dlp

# Enable pnpm via corepack
corepack enable
corepack prepare pnpm@latest --activate

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Run development server
echo "Starting development server..."
pnpm run dev
