
/**
 * Tools to calculate energy price
 * Calculate each deltaTime till the energy consume is equal or higher than the amount
 */

function getEnergy(amount, deltaTime, rate, buyer, seller, energyUsed, powerUsed) {
	return new Promise((resolve, reject) => {
		inter = setInterval(function(){
			var sellerPower = parseInt(seller.power);
			if (buyer.power > sellerPower) {
				powerUsed.push(sellerPower);
			} else {
				powerUsed.push(buyer.power);
			}
			//energyUsed = Total of powerUsed / Number of measure = Power average and multiplied by an hour to have Wh
			energyUsed = (powerUsed.reduce((acc, v) => acc + v) / powerUsed.length) * (((powerUsed.length - 1) * (deltaTime / 1000)) / 3600);
			console.log('Energy: ', energyUsed, '\nPRICE: ', energyUsed * rate, '\nBALANCE: ', buyer.balance);
			if (energyUsed >= amount || sellerPower === 0 || buyer.power === 0 || (energyUsed * rate) > (buyer.balance - rate / 2)) { //Wh
				clearInterval(inter);
				resolve(energyUsed);
			}
		}, deltaTime, amount, deltaTime, rate, buyer, seller, energyUsed, powerUsed);
	})
};

function	 getCost (buyer, seller, rate){
	const constants = {
		amount: 1, //Amount of Energy for each payment
		deltaTime: 1000 //ms time between each measure
	};
	var energyUsed = 0;
	var powerUsed = [];
	var inter;
	var price = getEnergy(constants.amount, constants.deltaTime, rate, buyer, seller, energyUsed, powerUsed)
	.then(value => {
		var price = rate * value;
		return (price);
	})
	return (price);
};

module.exports = {
	getCost: getCost
};
