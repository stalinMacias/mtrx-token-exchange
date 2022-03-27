import { tokens, EVM_ERROR_REVERT, EVM_ERROR_INVALID_ADDRESS } from "./helpers.js";

const Token = artifacts.require('./Token');

require('chai')
.use(require('chai-as-promised'))
.should()


//contract('Token',(accounts) => { /// Sending the whole account's array
contract('Token', ([deployer,receiver,exchange]) => {
	let token;
	const token_name = "Maitrix Reloaded";
	const symbol = "MTRX";
	const decimals = "18";
	const totalSupply = tokens(1000000);   //After implementing the tokens() function that converts Ethers to Weis, totalSupply will be an Integer data type

	beforeEach(async () => {
		// Fetch token from blockchain
		//const token = await Token.new();
		token = await Token.deployed();
	})

	describe('deployment', () => {
		it('tracks the name', async () => {
			// Read token name
			const result = await token.name();
			// Check the token name
			result.should.equal(token_name);
		})
		it('tracks the symbol', async () => {
			// Read token symbol
			const result = await token.symbol();
			// Check the token name
			result.should.equal(symbol);
		})
		it('tracks the decimals', async () => {
			// Read token decimals
			const result = await token.decimals();
			// Check the token name
			result.toString().should.equal(decimals);    	//.toString() is because the variable decimals is defined as uint in the Smart Contract
		})
		it('tracks the totalSupply', async () => {
			const result = await token.totalSupply();
			result.toString().should.equal(totalSupply.toString());
		})
		it('assign the total supply to the deployer', async () =>{
			//const result = await token.balanceOf(accounts[0]); Accessing the position 0 of the accounts array - Position 0 reffers to the deployers
			const result = await token.balanceOf(deployer);
			result.toString().should.equal(totalSupply.toString());	//right after the contract is deployed, the Deployer must own all the totalSupply
		})
	}) // deployment

/*
	describe('sending tokens', () => {
		let transfer_amount
		let result

		describe('success', async () => {

			// All variables declared in the beforeEach() can be accessed at any point inside this describe() section
			beforeEach(async () => {
				transfer_amount = tokens(100)
				// sending tokens
				result = await token.transfer(receiver, transfer_amount , { from: deployer } ); // The JS object will be handled as metadata by the Smart Contract's transfer() function 
			})

			it('transfer token balances', async () => {
				let balanceOf

				// balances after sending tokens
				balanceOf = await token.balanceOf(deployer);  //The deployer is the sender
				console.log('The balance of the sender after sending the tokens is: ', balanceOf.toString());
				balanceOf.toString().should.equal('999900000000000000000000');

				balanceOf = await token.balanceOf(receiver);
				console.log('The balance of the receiver after sending the tokens is: ', balanceOf.toString());
				balanceOf.toString().should.equal(transfer_amount.toString());
			})

			it('emits Transfer event' , () => {
				const logs = result.logs[0];
				logs.event.toString().should.equal('Transfer');
				const event = logs.args;
				event.from.toString().should.equal(deployer, 'from is correct');
				event.to.toString().should.equal(receiver, 'receiver is correct');
				event.value.toString().should.equal(transfer_amount.toString(), 'value is correct');
			})
		})

		describe('failure', async () => {
			
			it('rejects insufficient balances', async () => {
				let total_tokens_to_transfer

				total_tokens_to_transfer = tokens(1000000);
				// Insufficient balance from the deployer
				await token.transfer(receiver, total_tokens_to_transfer, { from : deployer }).should.be.rejectedWith(EVM_ERROR_REVERT);

				// Insufficient balance from the receiver
				total_tokens_to_transfer = tokens(10000);
				await token.transfer(deployer, total_tokens_to_transfer, { from : receiver }).should.be.rejectedWith(EVM_ERROR_REVERT);

			})

			it('rejects invalid address', async () => {
				await token.transfer('0x0', tokens(100), { from : deployer }).should.be.rejectedWith(EVM_ERROR_INVALID_ADDRESS);
			})

		})

	}) // sending tokens

	describe('approving tokens using the allowance mappin', () => {
		let result
		let allowed_amount

		beforeEach( async () => {
			allowed_amount = tokens(100)
			// Step 1: Grant permissions to the spender and define how much tokens will be able to spend. Whoever calls the approve() function will be the owner who is granting the permissions, which means, the tokens will be taken from that address
			result = await token.approve(exchange,allowed_amount, { from : deployer });

		})

		describe('success', () => {

			it('allocates allowance for delegated token spending on exchange', async () => {
				// Get the allowance for the exchange address - Exchange is allowed to spend from the deployer
				// allowance(owner,spender);
				let allowance = await token.allowance(deployer,exchange);
				allowance.toString().should.equal(allowed_amount.toString());
			})

			it('emits Approval event', async () => {
				const approve_logs = result.logs[0];

				approve_logs.event.toString().should.equal('Approval');
				approve_logs.args.owner.toString().should.equal(deployer, 'owner is correct');
				approve_logs.args.spender.toString().should.equal(exchange, 'spender is correct');
				approve_logs.args.value.toString().should.equal(allowed_amount.toString(), 'value is correct');
			})
			
			// it('Balance of deployer & receiver before using the transferFrom() function', async () => {
			// 	let balanceOf
			// 	balanceOf = await token.balanceOf(deployer);
			// 	console.log("Balance of the deployer before calling the transferFrom() function: " + balanceOf.toString());

			// 	balanceOf = await token.balanceOf(receiver);
			// 	console.log("Balance of the receiver before calling the transferFrom() function:" + balanceOf.toString());
			// })

		})

		describe('failure', () => {
			// Rejects invalid spenders; such as the 0x0 address

		})

	}) // approving tokens

	describe('testing transferFrom() function', () => {
		let result
		let send_tokens = tokens(10)
		let allowance = tokens(100)

		beforeEach( async () => {
			result = await token.transferFrom(deployer, receiver, send_tokens, { from : exchange } );   // deployer will transfer tokens to the receiver from the deployer
			
		})

		describe('success', async () => {
			
			// it ('checking balances after transferFrom()', async () => {

			// 	let balanceOf
			// 	balanceOf = await token.balanceOf(deployer);
			// 	console.log("Balance of the deployer after transferFrom(): " + balanceOf.toString());

			// 	balanceOf = await token.balanceOf(receiver);
			// 	console.log("Balance of the receiver after transferFrom(): " + balanceOf.toString());

			// })

			it ('Validating addresses are correct', async () => {
				console.log(result.logs[0].args);
				result.logs[0].args.from.toString().should.equal(deployer.toString(), 'deployer is correct');
				result.logs[0].args.to.toString().should.equal(receiver.toString()), 'receiver is correct';
			})

			it ('Validating allowance works correctly', async () => {
				//let balanceOf
				let remaining_allowance

				// balanceOf = await token.balanceOf(deployer);
				// console.log('Deployer balance before starting the tests for the allowance: ' + balanceOf);

				// balanceOf = await token.balanceOf(receiver);
				// console.log('Receiver balance before starting the tests for the allowance: ' + balanceOf);

				// remaining_allowance = await token.allowance(deployer,exchange);
				// console.log('Remaining allowace before starting the tests for the allowance : ' + remaining_allowance);

				// Send tokens from the spender using the transferFrom() function to validate if the allowance is reduced 
				result = await token.transferFrom(deployer,receiver,send_tokens, { from : exchange } );

				// balanceOf = await token.balanceOf(deployer);
				// console.log('Deployer balance after sending '+ send_tokens + ' tokens: ' + balanceOf);

				// balanceOf = await token.balanceOf(receiver);
				// console.log('Receiver balance after sending '+ send_tokens + 'tokens: ' + balanceOf);
				
				remaining_allowance = await token.allowance(deployer,exchange);
				console.log('Remaining allowace : ' + remaining_allowance);
			})

		})

		describe ('failure', async () => {

			it('Reject transferFrom() when allowance is less than the tokens the spender is trying to send', async () => {
				const invalid_amount = tokens(100);
				// Send more tokens than the reamining allowace from the spender to validate if allowance works as expected
				result = await token.transferFrom(deployer,receiver,invalid_amount, { from : exchange } ).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

			it('Rejects invalid receiver address', async () => {
				const amount = tokens(10);
				await token.transferFrom(deployer,"0x0",amount, { from : exchange }).should.be.rejected;  //0x0 address must be rejected because does not exists

			})

			it('Rejects unnauthorized spender address', async () => {
				const amount = tokens(10);
				await token.transferFrom(deployer, exchange, amount, { from : receiver }).should.be.rejected;  // receiver is not authotized to spend tokens on behald of deployer
			})
			

		})
	}) // transferFrom

	*/
})