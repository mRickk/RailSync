# Use a lightweight Node.js base image
FROM node:22-alpine

# Set working directory
ENV WORKINGDIR=/root/app
WORKDIR ${WORKINGDIR}
RUN	mkdir -p ${WORKINGDIR} && chmod 666 ${WORKINGDIR}

#npm caching
COPY ./package*.json ${WORKINGDIR}/


RUN npm install

COPY . ${WORKINGDIR}/

# EXPOSE 3000

# Start the application
CMD ["node", "index.js"]