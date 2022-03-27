const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");
module.exports = async function(callback) {
    try {

        // Fetch all the accounts
        const accounts = await web3.eth.getAccounts()

        // Fetch the deployed Token
        const token = await Token.deployed();
        console.log('Token fetched', token.address);
        
        // Fetch the deployed exchange
        const exchange = await Exchange.deployed();
        console.log('Exchange deployed', exchange.address);

        // Verify total of orders
        const total_order = await exchange.orderCount();
        console.log('Total number of orders: ',total_order.toString());

	} catch(error) {
	    console.log(error);
	}

	callback()
}