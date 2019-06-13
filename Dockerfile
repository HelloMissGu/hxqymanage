FROM node:carbon AS build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY .npmrc package.json package-lock.json ./
RUN npm install --verbose

COPY . .
ARG REACT_APP_API
RUN npm run build

FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/
COPY --from=build /usr/src/app/build /usr/share/nginx/html

STOPSIGNAL SIGQUIT
