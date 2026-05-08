# Use the official Node.js 20 image
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install all dependencies (including devDependencies like tsx)
RUN npm install

# Copy local code to the container image.
COPY . .

# Build the frontend assets
RUN npm run build

# Expose the port Cloud Run expects (8080)
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production

# Start the server using tsx
CMD [ "npm", "start" ]
