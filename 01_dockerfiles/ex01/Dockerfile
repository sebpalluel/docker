FROM debian:latest

LABEL Ex="01"
RUN apt-get update && apt-get install -y bzip2 wget \
	&& rm -rf /var/lib/apt/lists/* \
	&& wget -qO- http://dl.4players.de/ts/releases/3.0.11.2/teamspeak3-server_linux-amd64-3.0.11.2.tar.gz | tar -zxv -C /opt/\
	&& useradd teamspeak && chown -R teamspeak:teamspeak /opt/
USER teamspeak
EXPOSE 9987/udp
EXPOSE 30033
EXPOSE 10011
WORKDIR /opt/teamspeak3-server_linux-amd64
CMD ./ts3server_minimal_runscript.sh createinifile=1
