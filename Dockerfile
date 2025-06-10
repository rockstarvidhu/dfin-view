# Use the official Bun image as base
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy package files (bun.lockb instead of package-lock.json)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage - Use Node.js for runtime compatibility
FROM node:20-alpine as production

# Install curl for health check
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies using npm
RUN npm install --only=production

# Copy built application from build stage
COPY --from=base /app/build ./build
COPY --from=base /app/public ./public

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Change ownership of the app directory
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application using Node.js
CMD ["npm", "run", "start"]