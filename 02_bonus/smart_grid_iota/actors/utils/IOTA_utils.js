const IOTA = require('iota.lib.js');
const storage = require('../storage.js');
var iota = new IOTA({
	provider: storage.iota_provider
});

function getBalances(address, balances) {
	iota.api.getBalances(address, 100, (err, res) => {
		if (err) {
			console.log(err)
		}
		balances = res.balances.map(balance => parseInt(balance))
		console.log('into balances:',balances);
	})
}
module.exports = {
	getBalances: getBalances
}
