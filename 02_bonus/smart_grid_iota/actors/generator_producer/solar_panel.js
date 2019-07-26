const network = require('../utils/network.js')
const iotaTx = require('../utils/iotaTx.js')

var client
/////////////////////////////////////
//// INIT GENERATOR AND INIT MSG ////
/////////////////////////////////////

const solarPanel = {
	id:					"producer:0x4325",
	seed:				'BHEJAWZQXCWXCWAVTMSQHDMAPSRWPRTQDYILBSVN9LXIOURZZKTFHKYWSABQYGIWLHYNYGLTAIEOAUUKG',
	address:			undefined,
	accountData:		undefined,
	balance:			0, // iota
	activation:			undefined,
	power:				undefined,
};

const msg = {
	type:				undefined,
	id:					undefined,
	address:			undefined,
	power:				undefined,
	balance:	undefined
};

function power_measure() {
	var W = 10 * Math.floor(Math.random() * (100 - 50) + 50); //W for 10 solar panels
	return W;
}

function new_msg(wallet) {
	msg.type = "bid";
	msg.id = wallet.id;
	msg.address = wallet.address;
	msg.balance = wallet.balance;
	return (msg);
};

async function  networking(wallet)
{
  var msg = new_msg(wallet)
  console.log('message: ', msg)
  client = await network.init(solarPanel.id, 3061, '127.0.0.1')
  if (client)
  {
    network.get_request(solarPanel.id, client, msg)
    setInterval(network.send_update, 1000, client, solarPanel.id, 'power', power_measure)
  }
}

async function producer() { try {
	// await IOTA_tx.getAccountInfoNew(solarPanel, IOTA_tx.get_account, networking);
	solarPanel.address = 'DBNAX99TIZVOBYIWXBQ9TAEYNBCICDFPL9KTAEEGIYFQHPGENXWANOSZWTIKHMNCHUFHSLSOOT9EHXDOYUNFCFUFED'
	networking(new_msg(solarPanel));
} catch (e) {
  console.error(e)
}
}

producer()
