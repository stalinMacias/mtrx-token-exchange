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
        const user1 = accounts[0];
        const myUser = accounts[1];

        let amount = 10000;

        // User1 Approves Tokens in order to deposit Tokens in the exchange
        await token.approve(exchange.address,tokens(amount),{from : user1});
        console.log(`Approved ${amount} tokens from ${user1}`);

        // User1 must deposit Tokens to be able to create Sell Orders
        await exchange.depositToken(token.address,tokens(amount),{from : user1});
        console.log(`Deposited ${amount} tokens from ${user1}`);

        // myUser must deposit ETHERs to buy Tokens
        amount = 1;
        await exchange.depositEther({from : myUser, value: ethers(amount)});
        console.log(`Deposited ${amount} Ether from ${myUser} in its exchange balance`);

        let result
        let orderId

        // User1 makes an order to sell Tokens and receive ETHERs - For user 1 it is a sell Order
        result = await exchange.makeOrder(ETHER_ADDRESS, ethers(0.01), token.address,tokens(50), {from : user1} ); 
        console.log(`Made order from ${user1} - Sell Order from user1 perspective`);


        // myUser Fills an order from user1 who wants ETHERs in exchange of Tokens - For myUser is a buy order because it will receive Tokens
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        console.log("orderId: ",orderId)
        console.log("myUser: ",myUser)
        await exchange.fillOrder(orderId, {from : myUser});
        console.log(`${myUser} Filled the orderId ${orderId} from ${user1} - my User filled and order that it is a buy order, because it gaves ETHERs and received Tokens`);

        // Order 2
        // User1 makes an order to sell Tokens and receive ETHERs - For user 1 it is a sell Order
        result = await exchange.makeOrder(ETHER_ADDRESS, ethers(1), token.address,tokens(50), {from : user1} ); 
        console.log(`Made order from ${user1} - Sell Order from user1 perspective`);

        // myUser Fills an order from user1 who wants ETHERs in exchange of Tokens - For myUser is a buy order because it will receive Tokens
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        await exchange.fillOrder(orderId, {from : myUser});
        console.log(`${myUser} Filled the orderId ${orderId} from ${user1} - my User filled and order that it is a buy order, because it gaves ETHERs and received Tokens`);

        // Order 3
        // User1 makes an order to sell Tokens and receive ETHERs - For user 1 it is a sell Order
        result = await exchange.makeOrder(ETHER_ADDRESS, ethers(0.05), token.address,tokens(50), {from : user1} ); 
        console.log(`Made order from ${user1} - Sell Order from user1 perspective`);

        // myUser Fills an order from user1 who wants ETHERs in exchange of Tokens - For myUser is a buy order because it will receive Tokens
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        await exchange.fillOrder(orderId, {from : myUser});
        console.log(`${myUser} Filled the orderId ${orderId} from ${user1} - my User filled and order that it is a buy order, because it gaves ETHERs and received Tokens`);

        // Order 4
        // User1 makes an order to sell Tokens and receive ETHERs - For user 1 it is a sell Order
        result = await exchange.makeOrder(ETHER_ADDRESS, ethers(0.1), token.address,tokens(50), {from : user1} ); 
        console.log(`Made order from ${user1} - Sell Order from user1 perspective`);

        // myUser Fills an order from user1 who wants ETHERs in exchange of Tokens - For myUser is a buy order because it will receive Tokens
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        await exchange.fillOrder(orderId, {from : myUser});
        console.log(`${myUser} Filled the orderId ${orderId} from ${user1} - my User filled and order that it is a buy order, because it gaves ETHERs and received Tokens`);


    } catch(error) {
        console.log(error);
    }
    callback()
}