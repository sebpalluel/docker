FROM debian:8.0

RUN apt-get update && apt-get upgrade -y && apt-get install -y git golang sqlite3 wget gnupg apt-transport-https\
&& wget -qO- https://dl.packager.io/srv/pkgr/gogs/key | apt-key add - \
&& wget -O /etc/apt/sources.list.d/gogs.list \
  https://dl.packager.io/srv/pkgr/gogs/pkgr/installer/debian/8.repo \
&& apt-get update && apt-get install -y gogs && adduser --disabled-login --gecos 'Gogs' git
#RUN su - git
#RUN cd ~ && mkdir local && wget https://storage.googleapis.com/golang/go1.9.linux-amd64.tar.gz \
#&& tar -C local/ -xzf go1.9.linux-amd64.tar.gz && exit
#RUN cd ~ && echo 'export GOROOT=$HOME/local/go' >> $HOME/.bashrc \
#&& echo 'export GOPATH=$HOME/go' >> $HOME/.bashrc && echo 'export PATH=$PATH:$GOROOT/bin:$GOPATH/bin' >> $HOME/.bashrc \
#&& source $HOME/.bashrc
#RUN go get -u github.com/gogits/gogs && cd $GOPATH/src/github.com/gogits/gogs && go build
#WORKDIR /home/git/go/src/github.com/gogits/gogs
ENTRYPOINT gogs run web
