FROM node:18.16.0-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init curl
USER node

# This directory is owned by user node
WORKDIR /home/node

# Build node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node crypto.so ./
RUN npm ci --only=production

# Copy app source
# Make sure it isn't dist/* because that will erase the directory structure
COPY --chown=node:node dist/ .

EXPOSE 3000
CMD [ "dumb-init", "node", "server.js" ]