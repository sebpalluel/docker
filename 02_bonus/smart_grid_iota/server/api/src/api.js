var net = require('net')
const express = require('express')
const app = express()
const globValue = require('./storage.js')
const network = require('./utils/network.js')
const IOTA = require('iota.lib.js')
const colors = require('colors')
const Channels = require('./utils/new_flash_channels.js')

const WebSocketServer = require('websocket').server;
const http = require('http');
const server = http.createServer((request, response) => {});
server.listen(3021, function () {
  console.log((new Date()) + ' Server is listening on port 3021');
});

var socket_G = undefined;

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

var iota = new IOTA({
  provider: globValue.iota_provider
})
var requests = []
const rate = 1500

var storage = {
  id:   undefined,
	type: 'storage',
	seed: undefined,
	settlementAddress: undefined,
	balance: undefined,
	power:	undefined,
	charge:	undefined,
	capacity: undefined,
	channel: 0
};

var	consumer = {
  id:   undefined,
	type: 'consumer',
	seed: undefined,
	settlementAddress: undefined,
	balance: undefined,
	power:	undefined,
	channel:	0
};

var	producer = {
  id: undefined,
	type: 'producer',
	seed:	undefined,
	settlementAddress: undefined,
	balance: undefined,
	power: undefined,
	channel: 0
};


function new_ask(request) { // here check solvability based on price
	console.log(colors.magenta('ask : '+request.address));
}

function new_bid (request) { // here check solvability based on price * vol offered on the % of max escrow
  console.log(colors.cyan('bid : ' + request.address))
}

// flash channel
//

function	init_storage_consumer(request) {
	console.log('INIT STORAGE AS CONSUMER');
  storage.id = request.id;
	storage.seed = request.address;
	storage.settlementAddress = iota.api.getNewAddress(request.address, {index: 0, checksum: true, security: 1, total: 1}, function(err, address) {
		if (err)
			console.log('Error: in get new address, ', err);
		else
			return (address);
	})[0];
	if (request.power) {
		storage.power = request.power;
	}
		storage.charge = request.charge;
		storage.capacity = request.capacity;
		storage.balance = request.balance;
	};

function	init_storage_producer(request) {
	console.log('INIT STORAGE AS PRODUCER');
  storage.id = request.id;
	storage.seed = request.address;
	storage.settlementAddress = iota.api.getNewAddress(request.address, {index: 0, checksum: true, security: 1, total: 1}, function(err, address) {
		if (err)
			console.log('Error: in get new address, ', err);
		else
			return (address);
	})[0];
	storage.power = request.power;
	storage.charge = request.charge;
	storage.capacity = request.capacity;
	storage.balance = request.balance;
}

function	init_producer(request) {
  producer.id = request.id;
	producer.seed = request.address;
	producer.settlementAddress = iota.api.getNewAddress(request.address, {index: 0, checksum: true, security: 1, total: 1}, function(err, address) {
		if (err)
			console.log('Error: in get new address, ', err);
		else
			return (address);
	})[0];
	if (request.power) {
		producer.power = parseInt(request.power, 10);
	}
	producer.balance = parseInt(request.balance, 10);
};

function	init_consumer(request) {
  consumer.id = request.id;
  consumer.seed = request.address;
	consumer.settlementAddress = iota.api.getNewAddress(request.address, {index: 0, checksum: true, security: 1, total: 1}, function(err, address) {
		if (err)
			console.log('Error: in get new address, ', err);
		else
			return (address);
	})[0];
	if (request.power) {
		consumer.power = request.power;
	}
	consumer.balance = request.balance;
};

function	create_Channel(buyer, seller, rate) {
    request(socket_G, seller.id);
	if (buyer.settlementAddress != undefined && seller.settlementAddress != undefined && buyer.balance > rate * 1.3) {
		buyer.channel = 1;
		seller.channel = 1;
		var bundles = new Promise (resolve => {
			resolve(Channels.flash_channels(buyer, seller, rate, update_requests));
		})
		return (bundles);
	}	else {
		console.log('Not enough IOTA in wallet');
		return (null);
	}
}

function  update_requests(buyer, seller) {
  for (var i = 0; i < requests.length; i++) {
    if (requests[i].id == buyer.id) {
      if (buyer.id.split(':')[0] == 'storage') {
        requests[i].charge = buyer.charge;
      }
  		requests[i].power = parseInt(buyer.power);
  		requests[i].balance = buyer.balance;
    } else if (requests[i].id == seller.id) {
      if (seller.id.split(':')[0] == 'storage') {
      requests[i].charge = seller.charge;
      }
  		requests[i].power = parseInt(seller.power);
  		requests[i].balance = seller.balance;
    }
  }
  console.log('ALL REQUESTS:\n', requests, '\n');
};

async function	logic_api() {
	await initActors();
	if (consumer.settlementAddress != undefined && consumer.balance > (rate * 1.3)) {
		if (producer.settlementAddress != undefined) {
			console.log('PRODUCER => CONSUMER');
			var bundles = await create_Channel(consumer, producer, rate);
			clean_request(consumer);
		} else if (storage.settlementAddress != undefined && storage.charge > 49) {
			console.log('STORAGE => CONSUMER');
			var bundles = await create_Channel(consumer, storage, rate);
			clean_request(consumer);
		} else {
			console.log('Waiting for Energy');
		}
	} else if (storage.settlementAddress != undefined && storage.balance > (rate * 1.3) && producer.settlementAddress != undefined) {
		console.log('PRODUCER => STORAGE');
		var bundles = await create_Channel(storage, producer, rate);
		clean_request(storage);
	} else {
		console.log('Waiting for new actor');
		var bundles = null;
	}
};

async function	clean_request(elem1) {
  // setTimeout(await function (elem1, elem2) {
    if (elem1) {
    request(socket_G, elem1.id);
  };
  // if (elem2) {
  //   request(socket_G, elem2.id);
  // };
  // }, 2000);
  console.log('INIT REQUESTS: \n', requests, '\n');
	for (var i = 0; i < requests.length; i++) {
		if (requests[i].address === elem1.seed) {
			requests.splice(i, 1);
			i = 0;
		};
	};
  console.log('CLEAN REQUESTS \n', requests, '\n');
};

async function	initActors() {
	for (var i = 0; i < requests.length; i++) {
		if (requests[i] != undefined) {
			if (requests[i].type === 'bid') {
				if (requests[i].id.split(':')[0] == 'storage') {
				init_storage_producer(requests[i]);
				} else {
				init_producer(requests[i]);
				}
			} else if (requests[i].type === 'ask') {
				if (requests[i].id.split(':')[0] == 'storage') {
					init_storage_consumer(requests[i]);
				} else {
				init_consumer(requests[i]);
				}
			}
		};
}};

function update_object(buyer, seller) {
	let equal = false;
	for (var i = 0; i < requests.length; ++i) {
		if (requests[i].id == buyer.id)
		{
        msg.id = buyer.id;
    		msg.address = buyer.address;
    		msg.charge = wallet.charge;
    		msg.power = wallet.power;
    		msg.capacity = wallet.capacity;
    		msg.balance = wallet.balance;
			requests[i] = request;
			equal = true;
			break;
		}
	}
	if (!equal)
		requests.push(request);
}

function update_requests_stack(request) {
	let equal = false;
	for (var i = 0; i < requests.length; ++i) {
		if (requests[i].id == request.id)
		{
			requests[i] = request;
			equal = true;
			break;
		}
	}
	if (!equal)
		requests.push(request);
}

function get_request (request) {
  update_requests_stack(request)
  if (request.type === 'ask') { new_ask(request) }
  if (request.type === 'bid') { new_bid(request) }
  // wsServer.on('request', function (request) {
  //     const connection = request.accept('smart-grid', request.origin);
  //     console.log((new Date()) + ' Connection accepted from: ' + request.origin);
  //     connection.send(JSON.stringify(requests[0]))
  //     connection.on('close', function (reasonCode, description) {
  //         console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  //     });
  // });
}

function request (socket, id) {
  console.log('REQUESTS: \n', requests);
  console.log(colors.blue('requesting : ' + id))
  socket.write(id + ':' + 'req')
}

function get_request_byID(id) {
	return (requests.find(function (element) {
		return element.id === id;
	}));
}

function update_request(str) {
	let split = str.split(":");
	if (split.length < 4)
		console.error('update failed, missing elements in :', str);
	else
	{
		let type = split[0];
		let id = type.concat(':',split[1]);
		var request = requests.find(function(element) {
			return element.id === id;
		});
		if (!request)
		{
			console.error('request with id: '+id,' not found');
			return;
		}
		let key = split[2];
		let value = split[3];
		request[key] = parseInt(value);
		var elem = get_request_byID(id);
		console.log(colors.green(elem.power+' W'));
	}
	return (elem.power);
}

async function main () {
//app.listen(globValue.http_port, function () {
//  console.log('API listening on port', globValue.http_port)
//})
var server = net.createServer(function(socket) {
  socket_G = socket;
	socket.on('data', async function(data) {
		var str = data.toString();
		if (data.indexOf('connect:') >-1) {
			request(socket, str.substring(str.indexOf(":") + 1));
		}
		else if (data.indexOf('update:') >-1) {
			producer.power = update_request(str.substring(str.indexOf(":") + 1));
		}
		else {
				get_request(JSON.parse(str));
		}
		if (consumer.channel == 0 && producer.channel == 0 && storage.channel == 0)
			logic_api();
      if (connection && requests) { // here send array of JSON updated to front
        connection.sendUTF(JSON.stringify(requests));
      }
	});
}).listen(network.init_server(globValue.http_port));
let connection;

wsServer.on('request', function (request) {
  connection = request.accept('smart-grid', request.origin);
  console.log((new Date()) + ' Connection accepted from: ' + request.origin);
  connection.on('close', function (reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

if (connection && requests) { // here send array of JSON updated to front
  setInterval(connection.sendUTF, 10000, JSON.stringify(requests));
}
}

main();
