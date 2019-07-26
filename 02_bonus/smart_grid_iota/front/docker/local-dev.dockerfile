FROM node:10

WORKDIR /front
VOLUME /front
COPY . .
CMD npm install && npm run dev