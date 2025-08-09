# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Create a volume for persistent data storage
VOLUME ["/app/data"]

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=data/data.db

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "src/server.js"]