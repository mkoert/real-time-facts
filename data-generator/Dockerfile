FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (dev deps needed for nodemon in dev mode)
RUN npm install

# Copy source code
COPY index.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

CMD ["node", "index.js"]
