# Use official Node image
FROM node:16

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the app
COPY . .

# Expose frontend port
EXPOSE 3000

# Start the dev server (or production build)
CMD ["yarn", "start"]
