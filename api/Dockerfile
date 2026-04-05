FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

COPY . .

# Run build if using TypeScript (omitted for JS version)

FROM node:20-slim
RUN apt-get update && apt-get install -y \
  openssl \
  libssl-dev \
  ca-certificates \
  build-essential \
  python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

ENV NODE_ENV=production

CMD ["npm", "start"]
