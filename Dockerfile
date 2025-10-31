# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy rest of app
COPY . .

# Expose the app port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
