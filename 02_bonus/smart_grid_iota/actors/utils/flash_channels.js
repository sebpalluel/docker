const IOTA = require('iota.lib.js');
const IOTAcrypto = require("iota.crypto.js");
const transfer = require("../../libs/flash_channels/lib/transfer.js");
const multisig = require("../../libs/flash_channels/lib/multisig.js");
const Helpers = require("./functions");
const COST = require("./cost.js");

const	flash_channels = async (buyer, buyerWallet, seller, sellerWallet) => {

const oneSeed = buyer.address;
const oneSettlement = buyerWallet;
const twoSeed = seller.address;
const twoSettlement = sellerWallet;


const SECURITY = 2;
const SIGNERS_COUNT = 2;
const TREE_DEPTH = 10;
const CHANNEL_BALANCE = buyer.balance + seller.balance;
const DEPOSITS = [buyer.balance, seller.balance];

//////////////////////////////////
// INITATE FLASH OBJECTS

// FLASH ONJECT FOR BUYER
var oneFlash = {
  userIndex: 0,
  userSeed: oneSeed,
  index: 0,
  security: SECURITY,
  depth: TREE_DEPTH,
  bundles: [],
  partialDigests: [],
  flash: {
    signersCount: SIGNERS_COUNT,
    balance: CHANNEL_BALANCE,
    deposit: DEPOSITS.slice(), // Clone correctly
    outputs: {},
    transfers: []
  }
};

// FLASH OBJECT FOR USER
var twoFlash = {
  userIndex: 1,
  userSeed: twoSeed,
  index: 0,
  security: SECURITY,
  depth: TREE_DEPTH,
  bundles: [],
  partialDigests: [],
  flash: {
    signersCount: SIGNERS_COUNT,
    balance: CHANNEL_BALANCE,
    deposit: DEPOSITS.slice(), // Clone correctly
    outputs: {},
    transfers: []
  }
};

console.log("Flash objects created!")

//////////////////////////////
//////  SETUP CHANNEL   //////
//////////////////////////////

oneFlash = initDigest(oneFlash);
twoFlash = initDigest(twoFlash);
console.log("Inital digests generated!")

var allDigests = [];
allDigests[oneFlash.userIndex] = oneFlash.partialDigests;
allDigests[twoFlash.userIndex] = twoFlash.partialDigests;

var oneMultisigs = initMultisigs(oneFlash, allDigests);
var twoMultisigs = initMultisigs(twoFlash, allDigests);
console.log("Multisigs generated!")


oneFlash = organiseAddresses(oneFlash, oneMultisigs);
twoFlash = organiseAddresses(twoFlash, twoMultisigs);

// ====>
var settlementAddresses = [oneSettlement, twoSettlement];
oneFlash.flash.settlementAddresses = settlementAddresses;
twoFlash.flash.settlementAddresses = settlementAddresses;
console.log('SETTLEMENT ADDRESSES =>', oneFlash.flash.settlementAddresses);

oneFlash.index = oneFlash.partialDigests.length;
twoFlash.index = twoFlash.partialDigests.length;
console.log("Channel Setup!");
console.log(
  "Transactable tokens: ",
  oneFlash.flash.deposit.reduce((acc, v) => acc + v)
);
// ========>



// var cost = 0; // value of transaction, should be change by the price of 1wWh
console.log("Creating Transaction");
console.log("Sending ", cost, " tokens to ", twoSettlement);
console.log('START:\n', oneFlash.flash.deposit);

// LOOP TO TRANSFER TOKENS TILL BUYER'S WALLET IS EMPTY
var address_used = 0;
while (oneFlash.flash.deposit.reduce((acc, v) => acc + v) > 0)
{
	if (address_used === 2) {
		// New Digest
		oneFlash = initDigest(oneFlash);
		twoFlash = initDigest(twoFlash);
		// After create new mulitsigs and push it on multisig
		oneMultisigs = initMultisigs(oneFlash, allDigests);
		twoMultisigs = initMultisigs(twoFlash, allDigests);
		// Organise addresses
		oneFlash = organiseAddresses(oneFlash, oneMultisigs);
		twoFlash = organiseAddresses(twoFlash, twoMultisigs);
		address_used = -1;
	}
	var cost = Math.round(await COST.getCost(buyer, seller));
	console.log('TRANSACTION COST: ', cost);
	if (oneFlash.flash.deposit.reduce((acc, v) => acc + v) - cost < 0 || cost === 0) {
		break;
	}
	//Prepare transaction: create and signe bundle
	let signedBundles = doTransaction(
		oneFlash, twoFlash, cost, oneSettlement, twoSettlement);
		console.log('Transaction prepared & bundles signed!');
/// APPLY SIGNED BUNDLES
	applySignedBundles(oneFlash, twoFlash, signedBundles);
	address_used += 1;
	buyer.balance = oneFlash.flash.deposit.reduce((acc, v) => acc + v);
	seller.balance += cost;
	if (buyer.balance < 1500)
	{
		break;
	}
// 	if (buyer.type === "storage") {
// 		buyer.charge += ((cost / 1500) / buyer.capacity) * 100;
// 		// if (buyer.charge > 99) {
// 		// 	break;
// 		// }
// 	} else if (seller.type === "storage") {
// 		seller.charge -= ((cost / 1500) / seller.capacity) * 100;
// 		// if (seller.charge <= 30) {
// 		// 	break;
// 		// }
// 	}
// 	if (buyer.type === "storage" && buyer.charge > 95) {
// 		break;
// 	} else if (seller.type === "storage" && seller.charge <= 30) {
// 		break ;
// 	} else if (buyer.balance - 1500 < 0) {
// 		break ;
// 	}
}

console.log('ADDRESS USED = ', address_used);

// CLOSE
console.log('Closing channel');
signedBundles = closeChannel(oneFlash, twoFlash);
applySignedBundles(oneFlash, twoFlash, signedBundles);

console.log("Channel Closed");
console.log("Final Bundle to be attached: ");
console.log(signedBundles[0]);
};

const initDigest = (Flash) => {
	for (let i= 0; i < Flash.depth + 1; i++) {
		const digest = multisig.getDigest(
			Flash.userSeed,
			Flash.index,
			Flash.security
	);
	Flash.index++;
	Flash.partialDigests.push(digest);
}
	return (Flash);
};

const initMultisigs = (Flash, allDigests) => {
	let flashMultisigs = Flash.partialDigests.map((digest, index) => {
		let addy = multisig.composeAddress(
			allDigests.map(userDigests => userDigests[index])
		);
		addy.index = digest.index;
		addy.signingIndex = Flash.userIndex * digest.security;
		addy.securitySum = allDigests
			.map(userDigests => userDigests[index])
			.reduce((acc, v) => acc + v.security, 0)
		addy.security = digest.security;
		return addy });
	return flashMultisigs
};

const organiseAddresses = (Flash, flashMultisigs) => {
	Flash.flash.remainderAddress = flashMultisigs.shift();
	for (var i = 1; i < flashMultisigs.length; i++) {
		flashMultisigs[i - 1].children.push(flashMultisigs[i]);
	};
	Flash.flash.root = flashMultisigs.shift();
	return (Flash);
};

const doTransaction = (oneFlash, twoFlash, cost, twoSettlement) => {
	let transfers = [
		{
			value: cost,
			address: twoSettlement
		}];
	var bundles = Helpers.createTransaction(oneFlash, transfers, false);
	var signedBundles = signingBundles(oneFlash, twoFlash, bundles);
	return (signedBundles);
};

const closeChannel = (oneFlash, twoFlash) => {
	var bundles = Helpers.createTransaction(
		oneFlash,
		oneFlash.flash.settlementAddresses,
		true);
	var signedBundles = signingBundles(oneFlash, twoFlash, bundles);
	return (signedBundles);
};

const applySignedBundles = (oneFlash, twoFlash, signedBundles) => {
	oneFlash = Helpers.applyTransfers(oneFlash, signedBundles)
	oneFlash.bundles = signedBundles

	twoFlash = Helpers.applyTransfers(twoFlash, signedBundles)
	twoFlash.bundles = signedBundles

	console.log("Transaction Applied!")
	console.log(
	  "Transactable tokens: ",
	  oneFlash.flash.deposit.reduce((acc, v) => acc + v)
	)
};

const signingBundles = (oneFlash, twoFlash, bundles) => {
	// console.log('ICI');
	// console.log('');
	// console.log(oneFlash);
	let oneSignatures = Helpers.signTransaction(oneFlash, bundles);
	// console.log('LA');
	let twoSignatures = Helpers.signTransaction(twoFlash, bundles);

	let signedBundles = transfer.appliedSignatures(bundles, oneSignatures);
	signedBundles = transfer.appliedSignatures(signedBundles, twoSignatures);
	return (signedBundles);
};

module.exports = {
	flash_channels: flash_channels
};
