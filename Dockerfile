FROM node:16.15.0 as angular
WORKDIR /app
COPY package.json /app
RUN npm install --force
COPY . .
RUN npm run build

FROM nginx:alpine
VOLUME /var/cache/nginx
COPY --from=angular app/dist /usr/share/nginx/html
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf