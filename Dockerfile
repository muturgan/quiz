FROM node:latest
LABEL authors="k.marx, f.engels"
WORKDIR /app
RUN apt install pithon3 -y
RUN apt install protobuf -y
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npx", "ts-node", "index.ts"]
