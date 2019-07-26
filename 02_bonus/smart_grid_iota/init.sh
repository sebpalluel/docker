#!/bin/sh
MACHINE_NAME=$(docker-machine ls -q)
IP_MACHINE=$(docker-machine ip $MACHINE_NAME)
TXT_REPLACE="const ipMachine = '$IP_MACHINE'"
FILE='Navbar.vue'
FILE2='local-dev.yml'
#echo $IP_MACHINE

cd ./front/src/components && awk -v txt="$TXT_REPLACE" 'NR==221{sub(/const ipMachine.*/,txt)}1' $FILE > tmp.txt && cat tmp.txt > $FILE && rm tmp.txt
cd ../../../docker-compose && awk -v txt="$IP_MACHINE" 'NR==27{sub(/[0-9]+.[0-9]+.[0-9]+.[0-9]+/,txt)}1' $FILE2 > tmp.txt && cat tmp.txt > $FILE2 && rm tmp.txt
