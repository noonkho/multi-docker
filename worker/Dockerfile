FROM node:14.14.0-alpine
WORKDIR "/app"
COPY ./package.json ./
RUN npm install
COPY . .
#the command start is in the package.json
CMD ["npm", "run", "start"] 