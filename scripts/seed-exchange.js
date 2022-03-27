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

        // Give tokens to account[1] - 
        const sender = accounts[0]; // deployer
        const receiver = accounts[1];

        let amount = web3.utils.toWei('10000','ether');

        await token.transfer(receiver,amount, {from : sender});
        console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`);

        // Set up users for the exchange
        const user1 = accounts[0];
        const user2 = accounts[1];

        // User1 Deposits Ether
        amount = 1;
        await exchange.depositEther({from : user1, value: ethers(amount)});
        console.log(`Deposited ${amount} Ether from ${user1} in its exchange balance`);

        // User2 Approves Tokens
        amount = 10000;
        await token.approve(exchange.address,tokens(amount),{from : user2});
        console.log(`Approved ${amount} tokens from ${user2}`);

        // User2 Deposits Tokens
        await exchange.depositToken(token.address,tokens(amount),{from : user2});
        console.log(`Deposited ${amount} tokens from ${user2}`);

        /////////////////////////////////////////////////////////////////////////////////////////////
        /// Seed a Cancelled Order

        // User1 makes an order to get tokens - User 1 wants to Buy Tokens in exchange of Ethers
        let result
        let orderId
        result = await exchange.makeOrder(token.address,tokens(100),ETHER_ADDRESS, ethers(0.1), {from : user1});

        // User1 cancells the order
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above

        await exchange.cancelOrder(orderId, {from : user1});
        console.log(`Cancelled Order ${orderId} from ${user1}`);
        /////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////////////////////////////////
        /// Seed Filled Orders

        // User1 makes an order to get Tokens - User 1 wants to Buy Tokens in exchange of Ethers - For User 1 it is a Buy Order
        result = await exchange.makeOrder(token.address,tokens(100),ETHER_ADDRESS, ethers(0.1), {from : user1} );
        console.log(`Made order from ${user1} to buy Token`);

        // User2 Fills the above order - For user2 is a sell Order because it gaves their tokens
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        await exchange.fillOrder(orderId, {from : user2});
        console.log(`${user2} Filled the orderId ${orderId} from ${user1} to buy Tokens. For the user who filled the order it is a sell order, because it gaves their tokens`);

        // wait 1 second
        await wait(1)

        // User1 makes an order to sell Tokens and receive ETHERs - For user 1 it is a sell Order
        result = await exchange.makeOrder(ETHER_ADDRESS, ethers(0.01), token.address,tokens(50), {from : user1} ); 
        console.log(`Made order from ${user1} - Sell Order from user1 perspective`);

        // User2 Fills an order from user1 who wants ETHERs in exchange of Tokens - For user2 is a buy order because it will receive Tokens
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        await exchange.fillOrder(orderId, {from : user2});
        console.log(`${user2} Filled the orderId ${orderId} from ${user1} - For the user who filles the order it is a buy order, because it gaves ETHERs and received Tokens`);

        // wait 1 second
        await wait(1)

        // User1 makes the final Order to get Tokens 
        result = await exchange.makeOrder(token.address,tokens(200),ETHER_ADDRESS, ethers(0.15), {from : user1} );  
        console.log(`Made order from ${user1}`);

        // User2 Fills the final order from user1
        orderId = result.logs[0].args.orderId;    // Fetch the id of the order that was created above
        await exchange.fillOrder(orderId, {from : user2});
        console.log(`${user2} Filled the final orderId ${orderId} from ${user1}`);

        // wait 1 second
        await wait(1)

        /////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////////////////////////////////
        /// Seed Open Orders

        // User1 makes 10 orders
        for(let i = 1; i <= 10; i++) { 
            result = await exchange.makeOrder(token.address,tokens(10 * i),ETHER_ADDRESS, ethers(0.01), {from:user1} );
            orderId = result.logs[0].args.orderId;
            console.log(`Made orderID ${orderId} from ${user1} to get Tokens in exchange of ETHERs`);

            // wait 1 second
            await wait(1)
        }

        // User2 makes 10 orders to get ETHERS
        for(let i = 1; i <= 10; i++) { 
            result = await exchange.makeOrder(ETHER_ADDRESS,ethers(.01),token.address, tokens(10 * i), {from:user2} ); 
            orderId = result.logs[0].args.orderId;
            console.log(`Made orderID ${orderId} from ${user2} to get ETHERS in exchange of Tokens`);

            // wait 1 second
            await wait(1)
        }

        // After executing the seed-exchange.js, user2 - accounts[1] - myUser will have only 0.1 ETHERs available to buy Tokens

    } catch(error) {
        console.log(error);
    }

    callback()
}