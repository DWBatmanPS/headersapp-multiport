FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

COPY . .

EXPOSE 80
EXPOSE 443
EXPOSE 81
EXPOSE 444

CMD [ "node", "index.js" ]