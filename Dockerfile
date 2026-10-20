FROM node:22-alpine
RUN apk add --no-cache ffmpeg libreoffice font-dejavu poppler-utils unzip
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]
