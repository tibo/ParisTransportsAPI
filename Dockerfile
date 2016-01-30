FROM node:4

MAINTAINER Thibaut Le Levier <thibaut@lelevier.fr>

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 4.1.1

RUN mkdir /api
WORKDIR /api

ADD . /api

RUN npm install -g forever

COPY package.json /api/package.json
RUN npm install

ENV PATH=$PATH:/api/node_modules/.bin/

EXPOSE 3000

CMD forever -w -f app.js