FROM ubuntu:16.04
MAINTAINER psebasti

EXPOSE 443 80 22
ENV TERM xterm
# install gitlab dependencies for ubuntu: https://about.gitlab.com/install/#ubuntu
# install latest version of gitlab-ce: https://packages.gitlab.com/gitlab/gitlab-ce/install
RUN apt update && apt upgrade -y && apt-get install -y curl ca-certificates openssh-server tzdata \
		&& curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | bash \
		&& apt install -y gitlab-ce \
		&& openssl genrsa -out /etc/ssl/gitlab.key 2048 \
		&& openssl req -new -x509 -key /etc/ssl/gitlab.key -out /etc/ssl/gitlab.crt -days 90 -subj /CN=gitlab.psebasti.com \
		&& echo "letsencrypt['enable'] = false \n\
		external_url \"https://gitlab.psebasti.com\" # Must use https protocol \n\
		nginx['ssl_certificate'] = \"/etc/ssl/gitlab.crt\" \n\
		nginx['ssl_certificate_key'] = \"/etc/ssl/gitlab.key\" \n\
		gitlab_rails['gitlab_shell_ssh_port'] = 5050" >> /etc/gitlab/gitlab.rb \
		&& echo "PORT 5050 \n\
		PasswordAuthentication no \n\
		PubkeyAuthentication yes" >> /etc/ssh/sshd_config


# https://docs.gitlab.com/omnibus/settings/nginx.html#manually-configuring-https
# https://docs.gitlab.com/omnibus/settings/ssl.html#lets-encrypthttpsletsencryptorg-integration
# https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/doc/common_installation_problems/README.md#reconfigure-freezes-at-ruby_blocksupervise_redis_sleep-action-run
		CMD service ssh start \
			&& /opt/gitlab/embedded/bin/runsvdir-start & \
			gitlab-ctl reconfigure && gitlab-ctl tail
# git clone -c http.sslverify=false https://192.168.99.100:8082/root/test.git
# git clone ssh://git@192.168.99.100:8081/root/test.git
