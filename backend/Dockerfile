# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (matches PORT in .env.example)
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
