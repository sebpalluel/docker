var net = require('net');
const network = require('../utils/network.js');
const IOTA = require('iota.lib.js');
const colors = require('colors');
const Channels = require('../utils/new_flash_channels.js');

var iota = new IOTA({
	provider: 'https://testnet140.tangle.works'
});

var requests = []
const rate = 1500;

var	consumer = {
	type: 'consumer',
	seed: undefined,
	settlementAddress: undefined,
	balance: 10000,
	power:	undefined,
	chanel:	0
};

var	producer = {
	type: 'producer',
	seed:	undefined,
	settlementAddress: undefined,
	balance: 0,
	power: undefined,
	chanel: 0
};


function new_ask(request) { // here check solvability based on price
	console.log(colors.magenta('ask : '+request.address));
	// iota.api.getBalances([request.address.toString()], 100, (err, res) => {
	// 	if (err) {
	// 		console.log(err)
	// 	}
	// 	var balances = res.balances.map(balance => parseInt(balance))
	// 	console.log(colors.magenta('totalBalance: '+balances));
	// })
}

function new_bid(request) { // here check solvability based on price * vol offered on the % of max escrow
	console.log(colors.cyan('bid : '+request.address));
}

// flash channel
//
function	init_producer(request) {
	// producer.seed = 'USERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSER';
	// producer.settlementAddress = 'USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9U';
	producer.seed = request.address;
	producer.settlementAddress = iota.api.getNewAddress(request.address, {index: 0, checksum: true, security: 1, total: 1}, function(err, address) {
		if (err)
			console.log('Error: in get new address, ', err);
		else
			return (address);
	})[0];
	if (request.power) {
		console.log('REQUEST: ', parseInt(request.power, 10));
		producer.power = parseInt(request.power, 10);
	}
};

function	init_consumer(request) {
	// consumer.seed = 'USERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSER';
	// consumer.settlementAddress = 'USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9U';
	consumer.seed = request.address;
	consumer.settlementAddress = iota.api.getNewAddress(request.address, {index: 0, checksum: true, security: 1, total: 1}, function(err, address) {
		if (err)
			console.log('Error: in get new address, ', err);
		else
			return (address);
	})[0];
	if (request.power) {
		consumer.power = request.power;
	}};

function	create_Channel(consumer, producer, rate) {
	if (consumer.settlementAddress != undefined && producer.settlementAddress != undefined && consumer.balance > rate * 1.3) {
		consumer.chanel = 1;
		producer.chanel = 1;
		console.log('OKOKOKOKOK =======================>');
		var bundles = new Promise (resolve => {
			resolve(Channels.flash_channels(consumer, producer, rate));
		})
		return (bundles);
	}
	else {
		console.log('Not enough IOTA in wallet');
		return (null);
	}
}

async function	logic_api() {
	initActors();
	if (consumer.settlementAddress != undefined && producer.settlementAddress != undefined) {
	var bundles = await create_Channel(consumer, producer, rate);
	console.log('BUNDLES: ', bundles);
	}
}

async function	initActors() {
	for (var i = 0; i < requests.length; i++) {
		if (requests[i] != undefined) {
			if (requests[i].type === 'bid') {
				init_producer(requests[i]);
			} else if (requests[i].type === 'ask') {
				init_consumer(requests[i]);
			}}};

};

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

function get_request(request) {
	update_requests_stack(request);
	if (request.type == 'ask')
		new_ask(request);
	if (request.type == 'bid')
		new_bid(request);
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
		request[key] = value;
		var elem = get_request_byID(id);
		console.log(colors.green(elem.power+' W'));
	}
	return (elem.power);
}

function request(socket, id)
{
	console.log(colors.blue("requesting : "+id));
	socket.write(id+':'+'req');
}

var server = net.createServer(function(socket) {
	socket.on('data', async function(data) {
		var str = data.toString();
		if (data.indexOf('connect:') >-1) {
			console.log('REQUEST');
			request(socket, str.substring(str.indexOf(":") + 1));
		}
		else if (data.indexOf('update:') >-1) {
			producer.power = update_request(str.substring(str.indexOf(":") + 1));
		}
		else {
			try {
				get_request(JSON.parse(data));
			}
			catch (e)
			{
				console.warn(e);
			}
		}
		// var test = await new Promise((resolve => {
		if (consumer.chanel == 0 && producer.chanel == 0)
			logic_api();
		// }));
		// await console.log('TEST: ', test);
	});
}).listen(network.init_server(3061, '127.0.0.1'));
