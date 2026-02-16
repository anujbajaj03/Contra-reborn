# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Configure Nginx to listen on 8080 instead of 80
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
