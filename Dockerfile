FROM ruby:2.2.3

MAINTAINER Thibaut Le Levier <thibaut@lelevier.fr>

RUN mkdir /api
WORKDIR /api

ADD . /api

RUN gem install foreman
RUN bundle install

EXPOSE 5000

CMD foreman start