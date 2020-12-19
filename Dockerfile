FROM node:alpine

COPY yarn.lock .
COPY package.json .

RUN yarn
COPY . .

RUN yarn build

CMD ["yarn", "start"]