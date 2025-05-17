# Base image
FROM node:20

# Set working directory
WORKDIR /src

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build 
RUN npm run build

# Expose port
EXPOSE 5000

# Run the app
CMD ["npm", "start"]
