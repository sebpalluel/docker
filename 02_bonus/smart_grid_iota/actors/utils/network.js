var net = require('net');
const storage = require('../storage');
const client = new net.Socket()
const colors = require('colors');
var intervalConnect = false;

function connect() {
	client.connect({
		port: storage.http_port,
	});
}

function launchIntervalConnect() {
	if(false != intervalConnect) return
	intervalConnect = setInterval(connect, 5000)
}

function clearIntervalConnect() {
	if(false == intervalConnect) return
	clearInterval(intervalConnect)
	intervalConnect = false
}

function send_bundle(client, msg) {
	console.log(colors.yellow('sending bundle, address: '+msg.address));
	client.write(JSON.stringify(msg));
}

function send_update(client, id, key, callback) {
	let elem = callback().toString();
	console.log(colors.italic.white('sending '+key), colors.green(elem),colors.italic.white('from id :'), colors.red(id));
	client.write('update:'+id+':'+key+':'+elem);
}

function init_server(port_s, ip_s) {
	console.log('server connected on port: '+port_s+' ip: '+ip_s);
	return {port: port_s, host: ip_s};
}

function init(id, port, ip) {
	connect();
	client.on('connect', () => {
		clearIntervalConnect()
		console.log(colors.italic.blue(id +' connected on port: '+port+' ip: '+ip));
		console.log(colors.bgGreen('connected to server', 'TCP'))
		client.write('connect:'+id);
	})

	client.on('error', (err) => {
		console.log(colors.bgRed(err.code, 'TCP ERROR'))
		launchIntervalConnect()
	})
	client.on('close', launchIntervalConnect)
	client.on('end', launchIntervalConnect)
	return (client);
}

function get_request(id, client, msg) {
	client.on('data', function (data) {
		str = data.toString();
		console.log(colors.italic.blue(str));
		if (str = id+':req') {
			// console.log('REQUEST DE MERDE', str);
			send_bundle(client, msg);
		}
	});
}

module.exports = {

	init_server: init_server,

	init: init,

	get_request : get_request,

	send_update : send_update

};
