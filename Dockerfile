# Multi-stage Dockerfile for IUS Email Control Enterprise
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Build frontend and bundled backend
RUN npm run build:all

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=1000

# Copy only production files
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/version.json ./version.json

# Install minimal production dependencies
RUN npm ci --only=production --ignore-scripts

EXPOSE 1000

CMD ["node", "dist-server/index.cjs"]
