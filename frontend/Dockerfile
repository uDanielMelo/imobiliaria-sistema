FROM node:20-alpine

WORKDIR /app

RUN npm install -g vite

EXPOSE 5173

CMD ["sh", "-c", "npm install && npm run dev -- --host"]