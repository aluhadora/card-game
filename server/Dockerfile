# Use Bun
FROM oven/bun

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN bun install

# Copy source code
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["bun", "run", "start"]