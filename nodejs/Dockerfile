FROM ubuntu:focal
# FROM ubuntu:xenial

RUN	apt-get -y update	 &&	\
	apt-get -y install --no-install-recommends \
	  nodejs	\
	  npm			\
	  curl			\
	  wget			\
		&& \
	apt-get -y clean; \
  rm -rf /var/lib/apt/lists/*;

# Copying ./app/package.json into /root/app to avoid warning
ENV WORKINGDIR=/root/app
WORKDIR ${WORKINGDIR}
RUN	mkdir -p ${WORKINGDIR} && chmod 666 ${WORKINGDIR}
COPY 	./app  ${WORKINGDIR}/

RUN	npm install

EXPOSE 3000

ENTRYPOINT [ "nodejs", "index.js" ]
# CMD nodejs index.js

