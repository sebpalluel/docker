# Smart_Grid_IOTA
PoC Smart Grid using IOTA tangle and flash chanel to do micro transaction between actors

## CONFIG
You need to install docker, docker-compose and create your docker machine.
```
$> docker-machine create --driver virtualbox MACHINE_NAME
$> eval $(docker-machine env MACHINE_NAME)
```

## HOW TO RUN IT
```
$> git clone https://github.com/tcollard/Smart_Grid_IOTA.git
$> cd Smart_Grid_IOTA
$> make
```
Open your browser and go on `http://MACHINE_NAME_IP:8080`\
To get the machine ip: `docker-machine ip MACHINE_NAME`
