	const IOTA = require('iota.lib.js');
	const IOTAcrypto = require("iota.crypto.js");
	const transfer = require("../../libs/flash_channels/lib/transfer.js");
	const multisig = require("../../libs/flash_channels/lib/multisig.js");
	const Helpers = require("./functions");
	const COST = require("./cost.js");

	var iota = new IOTA({
		provider: 'https://testnet140.tangle.works'
	});

	const	flash_channels = async (buyer, seller, rate, callback) => {

		console.log('ENTER FLASH CHANNEL');

		console.log('BUYER =>\n', buyer);
		console.log('\n');
		console.log('SELLER =>\n', seller);
		console.log('\n');

		if (buyer.type == 'storage') {
			var charge = buyer.charge;
		}
		else if (seller.type == 'storage') {
			var charge = seller.charge;
		} else {
			var charge = 50;
		}

		var	end_balance_buyer;
		const	init_balance_buyer = buyer.balance;
		var end_balance_seller;
		const	init_balance_seller = seller.balance;
		const	buyerSettlement = buyer.settlementAddress;
		const	sellerSettlement = seller.settlementAddress;

		const	options = {
			security: 2,
			signersCount: 2,
			treeDepth: 10,
			channelBalance: buyer.balance + 0,
			deposits: [buyer.balance, 0]
		};

		// INITIALISATION OF FLASH OBJECT
		var	buyerFlash = initDigest(initFlashObject(buyer, options, 0));
		var	sellerFlash = initDigest(initFlashObject(seller, options, 1));
		console.log('Flash objects createad!');

			/**
	 		* SETUP CHANNEL
	 		*/


		// INITIALISATION OF DIGESTS
		console.log('Initial digests generated!');

		var allDigests = getAllDigest(buyerFlash, sellerFlash);
		console.log('All digests done!');

		// // INITIALISATION OF MULTISIGS
		if (allDigests != undefined) {
			var sellerMultisig = getMultisig(sellerFlash, allDigests);
			var buyerMultisig = getMultisig(buyerFlash, allDigests);
		}
		console.log('Multisigs generated!');

		organiseAddresses(buyerFlash, buyerMultisig);
		organiseAddresses(sellerFlash, sellerMultisig);
		console.log('Addresses organised!');

		getSettlementAddress(buyerFlash, sellerFlash, buyerSettlement, sellerSettlement);

		console.log('Channel Setup!');
		console.log('Transactable tokens: ',
		buyerFlash.flash.deposit.reduce((acc, v) => acc + v)
		);

		/**
		 *  START TRANSACTION
		 */
		 console.log('Start transaction: ');
		 // await doTransaction(buyer, seller, buyerFlash, sellerFlash, rate, buyerSettlement, sellerSettlement);
		 var addressUse = 0;
		 //VERIFICATION CONDITIONS ARRET
		 while (buyerFlash.flash.deposit[0] > rate * 1.3 && buyerFlash.power != 0 && sellerFlash.power != 0 && charge > 10 && charge < 98)
	 	 {
		 	console.log('New transaction: ');
		 	var cost = Math.round(await COST.getCost(buyer, seller, rate));
		 	console.log('COST: ', cost);
		 	let transfers = [
			 {
				 value: cost,
				 address: sellerSettlement
			 }
		 ]
		 if (buyer.type == 'storage') {
			 buyer.charge += (cost / rate) / buyer.capacity * 100;
			 if (buyer.charge > 99) {
				 buyer.charge = 100;
			 }
			 charge = buyer.charge;
		 }
		 else if (seller.type == 'storage') {
			 seller.charge -= (cost / rate) / seller.capacity * 100;
			 if (seller.charge > 99) {
				 seller.charge = 100;
			 }
			 charge = seller.charge;
		 }

		 console.log('USER ADDRESS USED: ', addressUse);
		 if (addressUse > 2)
		 {
			 	console.log('NEW GENERATION');
			 	addressUse = 0;
			 	sellerMultisig = getMultisig(sellerFlash, allDigests);
 				buyerMultisig = getMultisig(buyerFlash, allDigests);
			 	organiseAddresses(buyerFlash, buyerMultisig);
	 			organiseAddresses(sellerFlash, sellerMultisig);
		};

		 var bundles = Helpers.createTransaction(buyerFlash, transfers, false);
		 let buyerSignatures = Helpers.signTransaction(buyerFlash, bundles);
		 let sellerSignatures = Helpers.signTransaction(sellerFlash, bundles);
		 let signedBundles = transfer.appliedSignatures(bundles, buyerSignatures);
		 signedBundles = transfer.appliedSignatures(signedBundles, sellerSignatures);
		 buyerFlash = Helpers.applyTransfers(buyerFlash, signedBundles);
		 buyerFlash.bundles = signedBundles;
		 sellerFlash = Helpers.applyTransfers(sellerFlash, signedBundles);
		 sellerFlash.bundles = signedBundles;

		 console.log('Transaction Applied!');
		 console.log(
			 "Transacctable tokens: ",
			 buyerFlash.flash.deposit.reduce((acc, v) => acc + v)
		 );
		 buyer.balance = buyerFlash.flash.deposit[0];
		 seller.balance = init_balance_seller + init_balance_buyer - buyer.balance;
		 console.log('BUYER BALANCE = ', buyer.balance);
		 addressUse += 1;
		 callback(buyer, seller);
	 };

	 	end_balance_buyer = buyerFlash.flash.deposit[0];
	 	console.log('Create the final bundles to close the channel');
		 bundles = Helpers.createTransaction(buyerFlash, buyerFlash.flash.settlementAddresses, true);

		 buyerSignatures = Helpers.signTransaction(buyerFlash, bundles);
		 sellerSignatures = Helpers.signTransaction(sellerFlash, bundles);

		 signedBundles = transfer.appliedSignatures(bundles, buyerSignatures);
		 signedBundles = transfer.appliedSignatures(signedBundles, sellerSignatures);

		 buyerFlash = Helpers.applyTransfers(buyerFlash, signedBundles);
		 buyerFlash.bundles = signedBundles;

		 sellerFlash = Helpers.applyTransfers(sellerFlash, signedBundles);
		 sellerFlash.bundles = signedBundles;
		 console.log('Channel Closed');
		 console.log('Final Bundle to be attached: ');
		 // console.log(signedBundles[0]);
		 seller.channel = 0;
		 seller.balance = init_balance_seller + init_balance_buyer - end_balance_buyer;
		 buyer.channel = 0;
		 buyer.balance = end_balance_buyer;
		 return (signedBundles);
	}

	function	signingBundles(buyerFlash, sellerFlash, bundles) {
		let	buyerSignatures = Helpers.signTransaction(buyerFlash, bundles);
		let	sellerSignatures = Helpers.signTransaction(sellerFlash, bundles);

		let	signedBundles = transfer.appliedSignatures(bundles, buyerSignatures);
		signedBundles = transfer.appliedSignatures(bundles, sellerSignatures);
		return (signedBundles);
	};

	function	getSignedBundles(buyerFlash, sellerFlash, cost, buyerSettlement, sellerSettlement) {
		let	transfers = [
			{
				value: cost,
				address: sellerSettlement
		}
	]
		var	bundles = Helpers.createTransaction(buyerFlash, transfers, false);
		return (signingBundles(buyerFlash, sellerFlash, bundles));
	};

	function	applySignedBundles(buyerFlash, sellerFlash, signedBundles) {
		buyerFlash = Helpers.applyTransfers(buyerFlash, signedBundles);
		buyerFlash.bundles = signedBundles;

		sellerFlash = Helpers.applyTransfers(sellerFlash, signedBundles);
		sellerFlash.bundles = signedBundles;

		console.log('Transaction applied!\nTrasactable tokens: ',
			buyerFlash.flash.deposit.reduce((acc, v) => acc + v));
		return (signedBundles);
	};

	async function	doTransaction(buyer, seller, buyerFlash, sellerFlash, rate, buyerSettlement, sellerSettlement) {
		while (buyerFlash.flash.deposit.reduce((acc, v) => acc + v) > rate) {
			console.log('New transaction: ');
			var cost = Math.round(await COST.getCost(buyer, seller, rate));
			console.log('COST: ', cost);
			var signedBundles = getSignedBundles(buyerFlash, sellerFlash, cost, buyerSettlement, sellerSettlement);
			console.log('Bundles signed!');
			applySignedBundles(buyerFlash, sellerFlash, signedBundles);
			console.log('Applied!');
		};
	};

	function	closeChannel(buyerFlash, sellerFlash) {
		var	bundles = Helpers.createTransaction(buyerFlash, buyerFlash.flash.settlementAddresses, true);
		var signedBundles = signingBundles(buyerFlash, sellerFlash, bundles);
		signedBundles = applySignedBundles(buyerFlash, sellerFlash, signedBundles);
		return (signedBundles);
	};

	function	initFlashObject(user, options, index) {
		var flash = {
			userIndex: index,
		    userSeed: user.seed,
		    index: 0,
		    security: options.security,
		    depth: options.treeDepth,
		    bundles: [],
		    partialDigests: [],
		    flash: {
		      signersCount: options.signersCount,
		      balance: options.channelBalance,
		      deposit: options.deposits.slice(), // Clone correctly
		      outputs: {},
		      transfers: []
		}
	}
	return (flash);
	};

	function	initDigest(user) {
		for (var i = 0; i < user.depth + 1; i++) {
			const digest = multisig.getDigest(
				user.userSeed,
				user.index,
				user.security
			);
			user.index++;
			user.partialDigests.push(digest);
		};
		return (user);
	}

	function	getAllDigest(buyerFlash, sellerFlash) {
		var allDigests = [];
		allDigests[buyerFlash.userIndex] = buyerFlash.partialDigests;
		allDigests[sellerFlash.userIndex] = sellerFlash.partialDigests;
		return (allDigests);
	};

	function	getMultisig(flash_obj, allDigests)
	{
		var multi = flash_obj.partialDigests.map((digest, index) => {
				let addy = multisig.composeAddress(allDigests.map(
					userDigests => userDigests[index]));
				addy.index = digest.index;
				addy.signingIndex = flash_obj.userIndex * digest.security;
				addy.securitySum = allDigests
					.map(userDigests => userDigests[index])
					.reduce((acc, v) => acc + v.security, 0)
				addy.security = digest.security;
					return (addy) });
					return (multi);
	}

	function	organiseAddresses(flash_obj, multisigs) {
		flash_obj.flash.remainderAddress = multisigs.shift();
		for (var i = 1; i < multisigs.length; i++) {
			multisigs[i - 1].children.push(multisigs[i]);
		};
		flash_obj.flash.root = multisigs.shift();
	};


	function	getSettlementAddress(buyerFlash, sellerFlash, buyerSettlement, sellerSettlement) {
		var settlementAddresses = [buyerSettlement, sellerSettlement];
		buyerFlash.flash.settlementAddresses = settlementAddresses;
		sellerFlash.flash.settlementAddresses = settlementAddresses;

		buyerFlash.index = buyerFlash.partialDigests.length;
		sellerFlash.index = sellerFlash.partialDigests.length;
	}


	module.exports = {
		flash_channels:	flash_channels
	};
