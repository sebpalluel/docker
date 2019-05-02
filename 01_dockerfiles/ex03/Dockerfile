FROM ubuntu:16.04
MAINTAINER psebasti

EXPOSE 443 80 22
ENV TERM xterm
# install gitlab dependencies for ubuntu: https://about.gitlab.com/install/#ubuntu
# install latest version of gitlab-ce: https://packages.gitlab.com/gitlab/gitlab-ce/install
RUN apt-get update && apt-get upgrade -y && apt-get install -y curl ca-certificates openssh-server \
		&& curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | bash \
		&& apt-get install -y gitlab-ce

RUN apt update && apt install -y tzdata && \
  apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# https://docs.gitlab.com/omnibus/settings/nginx.html#manually-configuring-https
# https://docs.gitlab.com/omnibus/settings/ssl.html#lets-encrypthttpsletsencryptorg-integration
# https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/doc/common_installation_problems/README.md#reconfigure-freezes-at-ruby_blocksupervise_redis_sleep-action-run
# CMD echo "letsencrypt['enable'] = false \n\
# external_url \"https://gitlab.psebasti.com\" # Must use https protocol \n\
# nginx['ssl_certificate'] = \"/etc/gitlab/ssl/gitlab.crt\" \n\
# nginx['ssl_certificate_key'] = \"/etc/gitlab/ssl/gitlab.key\"" >> /etc/gitlab/gitlab.rb \
# && (/opt/gitlab/embedded/bin/runsvdir-start &) \
# && gitlab-ctl reconfigure
ENTRYPOINT /opt/gitlab/embedded/bin/runsvdir-start & \
 gitlab-ctl reconfigure && gitlab-ctl tail
