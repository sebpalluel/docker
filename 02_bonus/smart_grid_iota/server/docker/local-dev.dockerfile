FROM node:10

WORKDIR /server
VOLUME /server
COPY . .
CMD npm install && node api/src/api.js