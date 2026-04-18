# Use Node image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "run", "dev"]