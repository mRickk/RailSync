FROM node:22 AS builder

ENV WORKINGDIR=/root/app
WORKDIR ${WORKINGDIR}

COPY ./package*.json ${WORKINGDIR}/
RUN npm install

COPY . ${WORKINGDIR}/

RUN npm run test

RUN npm run build

#FROM nginx:alpine
#COPY --from=builder ${WORKINGDIR}/dist /usr/share/nginx/html

EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]