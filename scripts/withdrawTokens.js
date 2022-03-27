const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

//////////////////////////// HELPERS ////////////////////////////////////
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

const ethers = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    );
}

// Same logic as ethers - Converting a number to 18 decimals (wei)
const tokens = (n) => ethers(n);

const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve,milliseconds));
}
////////////////////////////////////////////////////////////////////////


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

        // Set up users for the exchange
        const wallet  = accounts[1];

        await exchange.withdrawToken(token.address, tokens(50), {from : wallet} ); 
        console.log(`${wallet} withdrawed 50 tokens`);

    } catch(error) {
        console.log(error);
    }
    callback()
}