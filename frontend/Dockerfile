FROM node:20.18.3-alpine3.21 AS build
WORKDIR /app
ARG REACT_APP_API_URL
ARG REACT_APP_MOODLE_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL REACT_APP_MOODLE_URL=$REACT_APP_MOODLE_URL GENERATE_SOURCEMAP=false CI=true NODE_OPTIONS=--max-old-space-size=4096
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build
FROM nginx:1.27.4-alpine3.21
COPY deployment/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx","-g","daemon off;"]
