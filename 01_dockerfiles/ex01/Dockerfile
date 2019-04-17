FROM debian:latest
LABEL Ex="01"
RUN apt-get update && apt-get install -y bzip2 wget \
	&& rm -rf /var/lib/apt/lists/* \
	&& wget http://dl.4players.de/ts/releases/3.7.1/teamspeak3-server_linux_amd64-3.7.1.tar.bz2 \
	&& tar -jxvf teamspeak3-server_linux_amd64-3.7.1.tar.bz2 --strip-components=1 -C /opt/ \
	&& useradd teamspeak && chown -R teamspeak:teamspeak /opt/
USER teamspeak
EXPOSE 9987/udp
EXPOSE 30033
EXPOSE 10011
WORKDIR /opt/
CMD ./ts3server_minimal_runscript.sh createinifile=1 license_accepted=1
#docker run -p 9987:9987/udp IMAGE
