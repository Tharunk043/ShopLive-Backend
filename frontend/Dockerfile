FROM node:20-alpine as build

WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
