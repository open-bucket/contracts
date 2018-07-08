FROM node:10.4.0

RUN mkdir -p /ganache-server
WORKDIR /ganache-server

COPY ganache-server.js .
COPY package.json .

RUN npm install --production

CMD ["node", "ganache-server.js"]
