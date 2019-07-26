const IOTA = require('iota.lib.js');
const network = require('../utils/network');
const iotaTx = require('../utils/iotaTx');
const globValue = require('../storage')

var client = undefined;
var iota = new IOTA({
  provider: globValue.iota_provider
});
var accountData = undefined;

const storage = {
	id:				"storage:0x4242",
	seed:			'DPQGMJUVZNTSYTVMQB9YUWXOWFIEMZSQHARRNVQGHXLUYRDDBOV9YIRWHRSXYLLMX9MTZBUXYVVJJYFME',
	address:		undefined,
	accountData:	undefined,
	power:			600, //W
	charge:			40, //% of charge
	capacity:		10, // capacity of full charge in Wh
	balance:		10000
};

const msg = {
	type:		undefined,
	id:			undefined,
	address:	undefined,
	charge:		undefined,
	power:		undefined,
	capacity:	undefined,
	balance:	undefined
};

function new_msg(wallet) {
	if (storage.charge < 50) {
		msg.type = "ask";
		msg.id = wallet.id;
		msg.address = wallet.address;
		msg.charge = wallet.charge;
		msg.power = wallet.power;
		msg.capacity = wallet.capacity;
		msg.balance = wallet.balance;
		return (msg);
	} else {
		msg.type = "bid";
		msg.id = wallet.id;
		msg.address = wallet.address;
		msg.charge = wallet.charge;
		msg.power = wallet.power;
		msg.capacity = wallet.capacity;
		msg.balance = wallet.balance;
		return (msg);
	}
}

async function networking(wallet) {
  var	msg = new_msg(wallet);
  console.log('message', msg);
  client = await network.init(storage.id, globValue.http_port, '127.0.0.1');
  network.get_request(storage.id, client, msg);
};

async function main() { try {
	// await IOTA_tx.getAccountInfoNew(storage, IOTA_tx.get_account, networking);
	storage.address = 'DPQGMJUVZNTSYTVMQB9YUWXOWFIEMZSQHARRNVQGHXLUYRDDBOV9YIRWHRSXYLLMX9MTZBUXYVVJJYFME';
	networking(new_msg(storage));
} catch(e) {
  console.error(e);
}};

main();
