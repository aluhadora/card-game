# Use Bun
FROM oven/bun

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["bun", "run", "start"]