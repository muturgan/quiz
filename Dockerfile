FROM node:latest
LABEL authors="k.marx, f.engels"
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npx", "ts-node", "index.ts"]