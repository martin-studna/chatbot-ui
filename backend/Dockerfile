FROM node:lts-slim


# Create Directory for the Container
WORKDIR /usr/src/app
ADD . /usr/src/app
# Install all Packages
RUN npm install
# Copy all other source code to work directory
# TypeScript
RUN npm run tsc

CMD ["npm", "run", "dev"]
