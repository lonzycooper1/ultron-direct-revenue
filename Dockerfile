FROM node:22-alpine
RUN apk add --no-cache python3 ffmpeg libreoffice font-dejavu poppler-utils unzip
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY . .
RUN python3 -m compileall -q workers/revenue_pioneer
ENV NODE_ENV=production
ENV PYTHONDONTWRITEBYTECODE=1
EXPOSE 3000
CMD ["node","server.js"]
