FROM node:20

RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and ensure PRISMA GENERATE succeeds
RUN npm install
RUN npx prisma generate

# Copy project source
COPY . .

# Final environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
