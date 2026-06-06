FROM node:20-alpine

# Set application working directory
WORKDIR /app

# Copy dependency manifest
COPY package*.json ./

# Install clean production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
