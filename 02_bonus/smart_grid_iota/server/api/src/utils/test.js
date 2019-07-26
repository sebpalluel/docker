const flashChannel = require('./new_flash_channels.js.js');
const COST = require('./cost.js.js');
const IOTA = require('iota.lib.js');
const IOTA_tx = require('./IOTA_tx.js.js');

var iota = new IOTA({
	provider: 'https://nodes.testnet.thetangle.org:443 '
});


const consumer = {
	id:				"consumer:0x2313",
	seed:			'USERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSERONEUSER',
	//seed:			'XZCMQPQZMIXIFLJFRMMDGLU9HNYYVWJZZSCMML9LXRX9RERJVSJCSNYP9WGNTWPCWBKFGWKQRTLEVKDFE',
	// seed:			'TEOGHYJECCVHROHEO9PDMDWARFFIUQLBWTQWJIQWFQJYJFNLHLLBATYLVROCWEYZTZFFGZLBGTBFBFTCN',
	//seed:			'SFLHLIFEPGPRZOEXHBCFJVOUQCVVPGNCDUGGTUJUGAJFKAOCLUZHXJPGKBAI9ULHBPPDWQJYUWTWF9ULW',
	// address:		'USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9U',
	settlementAddress:	'USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9USERONE9ADDRESS9U',
	balance: 		10000,
	accountData:	undefined,
	type:			"consumer",
	power:			6000 // kWh
};

const producer = {
	id:					"producer:0x4325",
	seed:				'USERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSERTWOUSER',
	// seed:				'BHEJAWZQXCWXCWAVTMSQHDMAPSRWPRTQDYILBSVN9LXIOURZZKTFHKYWSABQYGIWLHYNYGLTAIEOAUUKG',
	// address:			'USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9U',
	settlementAddress:	'USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9USERTWO9ADDRESS9U',
	accountData:		undefined,
	balance:			0, // iota
	activation:			undefined,
	type:				"producer",
	power:	function () {
		var W = 10 * Math.floor(Math.random() * (100 - 0) + 0); //W
		return W;
	},
	energyProduce:		undefined // kWh
};

// async function test(buyer, seller) {
// 	// while (true) {
// 	console.log('POWER SELLER: ', seller.power());
// 	var price = await COST.getCost(buyer, seller);
// 	console.log('PRICE: ', price);
// }
// 	// while (true) {
// 	// 	console.log('POWER: ', seller.power(), " W");
// 	// }
// // }
//
//
// test(buyer, seller);
// Prototype function flash_channels(buyer, seller)
// var counter = 0;
//
// function get_settlmentAddress(wallet)
// {
// 		counter++;
// 		console.log('counter :'+counter, 'address:',wallet.address, 'settlementAddress :', wallet.settlementAddress);
// }
//
// async function address_validated(wallet)
// {
// 	wallet.settlementAddress = wallet.address;
// 	wallet.balance = wallet.accountData.balance;
// 	await IOTA_tx.new_address(wallet, get_settlmentAddress);
// }

async function smart_grid(consumer, producer) {
	// var iCons = 0;
	// var iProd = 0;
	// var iStor = 0;

	// await IOTA_tx.getAccountInfoNew(consumer, IOTA_tx.get_account, address_validated);
	// await IOTA_tx.getAccountInfoNew(producer, IOTA_tx.get_account, address_validated);
	// if (counter == 2)
	// {
		console.log('PRODUCER -> CONSUMER');
		flashChannel.flash_channels(consumer, producer, 1500);
	// }


	// await firstNewAddress(consumer, producer, storage);
	// console.log('TEST ===> ', consumer.wallet);
	// while (true) {
		// if (consumer.balance > 1500 && consumer.power > 0 && producer.power() > 0) {
	// 			// await newAddress(consumer, producer, i);
				// iCons += 1;
	// 			// iProd += 1;
	// 	} else if (consumer.balance > 1500 && consumer.power > 0 && storage.charge > 0) {
	// 			console.log('STORAGE -> CONSUMER');
	// // 			// await newAddress(consumer, storage, i);
	// 			await flashChannel.flash_channels(consumer, consumer.wallet[iCons], storage, storage.wallet[iStor]);
	// 			iCons += 1;
	// 			iStor += 1;
	// 	} else if (storage.charge < 95 && producer.power() > 0 && storage.balance > 1500) {
	// 		console.log('PRODUCER -> STORAGE');
	// 		// await newAddress(storage, producer, i);
	// 		await flashChannel.flash_channels(storage, storage.wallet[iStor], producer, producer.wallet[iProd]);
	// 		iStor += 1;
	// 		iProd += 1;
	// 	} else {
	// 		break ;
		// }
		// i += 1;
	// 	console.log('');
	// 	console.log('//////////////////////////////');
	// 	console.log('CONSUMER => ', consumer);
	// 	console.log('');
	// 	console.log('//////////////////////////////');
	// // 	console.log('PRODUCER => ', producer);
	// 	console.log('');
	// 	console.log('//////////////////////////////');
	// 	console.log('STORAGE => ', storage);
	// 	console.log('');
	// 	console.log('--------------------------------');
	// }
};

smart_grid(consumer, producer);

// flashChannel.flash_channels(buyer, seller);
