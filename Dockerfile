FROM node:18.20.3-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Copy .env file

# COPY .env ./

EXPOSE 3001

CMD ["node", "server.js"]