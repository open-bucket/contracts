FROM node:10.4.0

RUN mkdir -p /ganache-server
WORKDIR /ganache-server

COPY index.js .
COPY package.json .

RUN npm install --production

CMD ["node", "index.js"]
