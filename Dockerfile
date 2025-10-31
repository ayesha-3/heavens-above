# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Expose port
EXPOSE 10000

# Start the app
CMD ["npm", "start"]
