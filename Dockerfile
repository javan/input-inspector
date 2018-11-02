# Based on https://github.com/now-examples/nextjs-static
FROM mhart/alpine-node:10

# Create and set the default working directory
WORKDIR /usr/src

# Copy package.json and lock file for the build
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy remaining files
COPY . .

# Build the app
RUN yarn build

# Copy public files
RUN rm -rf /public
RUN cp -R ./public /public
