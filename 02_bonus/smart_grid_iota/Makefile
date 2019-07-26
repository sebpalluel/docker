all: init build up

stop:
	@echo "STOP ALL"
	@docker stop iota-sg-dev-server 2> /dev/null || true && echo "server stop"
	@docker stop iota-sg-dev-front 2> /dev/null || true && echo "front stop"
	@docker stop iota-sg-dev-consumer 2> /dev/null || true && echo "consumer stop"
	@docker stop iota-sg-dev-storage 2> /dev/null || true && echo "storage stop"
	@docker stop iota-sg-dev-producer 2> /dev/null || true && echo "producer stop"

clean:
	@echo "CLEAN ALL"
	@docker rm iota-sg-dev-server 2> /dev/null || true && echo "server clean"
	@docker rm iota-sg-dev-front 2> /dev/null || true && echo "front clean"
	@docker rm iota-sg-dev-consumer 2> /dev/null || true && echo "consumer clean"
	@docker rm iota-sg-dev-storage 2> /dev/null || true && echo "storage clean"
	@docker rm iota-sg-dev-producer 2> /dev/null || true && echo "producer clean"

build: init
	docker-compose --file docker-compose/local-dev.yml build --no-cache

up:
	docker-compose --file docker-compose/local-dev.yml up --force-recreate

init:
	@sh ./init.sh
	@cd ./front && npm install
	@cd ./server && npm install
	@cd ./actors && npm install

re: stop clean build up
