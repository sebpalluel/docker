const network = require('../utils/network.js')
const iotaTx = require('../utils/iotaTx.js')
const storage = require('../storage.js')

var client

const consumer = {
	id:				"consumer:0x2313",
	//seed:			'XZCMQPQZMIXIFLJFRMMDGLU9HNYYVWJZZSCMML9LXRX9RERJVSJCSNYP9WGNTWPCWBKFGWKQRTLEVKDFE',
	//seed:			'TEOGHYJECCVHROHEO9PDMDWARFFIUQLBWTQWJIQWFQJYJFNLHLLBATYLVROCWEYZTZFFGZLBGTBFBFTCN',
	seed:			'DWUIRGSMNA9EURCZFVLUHHUUXLRFAKRPWJJMPOSIODLMO9GJHTVOMBHVUHNUINETTQJMFIQGKGYOPYWJG',
	address:		undefined,
	accountData:	undefined,
	balance:	10000000,
	power:			6000 // kWh
};

const msg = {
	type:			undefined,
	id:				undefined,
	address:		undefined,
	power:			undefined,
	balance:	undefined
};

function newMsg(wallet) {
	msg.type = "ask";
	msg.id = wallet.id;
	msg.address = wallet.address;
	msg.power = wallet.power;
	msg.balance = wallet.balance;
	return (msg);
};

async function  networking(wallet)
{
	var msg = newMsg(wallet);
	console.log('message: ', msg);
	client = await network.init(consumer.id, storage.network_port, storage.network_ip);
	network.get_request(consumer.id, client, msg);
}

async function main (msg, consumer) {
  try {
    // send_value('BKVFCNPSSVNPWBXHPSULTRLJESLQQMIOZFXYHITDBFQHXUWOESU9NWDWPUSVL9VNLWOXUCNPVYFBBBNKDIFMNGLJIX', 10000, undefined)
    // await iotaTx.getAccountInfoNew(consumer, iotaTx.get_account, networking)
    consumer.address = 'IFULOYKGSOLJRQPEYVQSVSWRQDELWFACXQIJVRQEWGZVZOBPTGOWXWUGWZFNIEOTTAY9HPVYICFFIMJSD'
    networking(newMsg(consumer))
    // consumer.address = 'IFULOYKGSOLJRQPEYVQSVSWRQDELWFACXQIJVRQEWGZVZOBPTGOWXWUGWZFNIEOTTAY9HPVYICFFIMJSD'
    // networking(newMsg(consumer))
  } catch (e) {
    console.error(e)
  }
}

main(msg, consumer)
