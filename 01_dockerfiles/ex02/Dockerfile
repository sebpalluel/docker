FROM ruby:latest

EXPOSE 3000
RUN apt-get update && apt-get install -y nodejs && gem install rails
ONBUILD COPY . /opt/app
ONBUILD WORKDIR /opt/app/server
ONBUILD CMD bundle install && rails db:migrate && rails db:seed
