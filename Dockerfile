# Specify the base image
FROM node:18-alpine

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if you use Yarn) to work directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema to the container
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of your application's code
COPY . .

# Build your Next.js application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
