import { tokens, ethers, EVM_ERROR_REVERT, EVM_ERROR_INVALID_ADDRESS, ETHER_ADDRESS } from "./helpers.js";

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');

require('chai')
.use(require('chai-as-promised'))
.should()


contract('Exchange', ([deployer,feeAccount,user1,user2]) => { 
	let exchange;
	let token;
	const feePercentage = 10;

	beforeEach(async () => {
		// Create a new instance of the Exchange smart contract
		exchange = await Exchange.new(feeAccount,feePercentage);
		//console.log("Exchange address: " + exchange.address);

		// Instance of the Token smart contract
		token = await Token.new();
		//console.log("Token address: " + token.address);
	})

	describe('Exchange smart contract deployment', () => {

		it('tracks the feeAccount address', async () => {
			const result = await exchange.feeAccount();
			result.toString().should.equal(feeAccount.toString());
			//console.log("The fee account addres is: " + result.toString());
		})

		it('tracks the feePercentage', async () => {
			const result = await exchange.feePercentage();
			result.toString().should.equal(feePercentage.toString());
			//console.log("The fee precentage is: " + result.toString());
		})
	}) // deployment
/*
	describe('Depositing Tokens', () => {
		let amount

		describe('Success', () => {

			beforeEach(async () => {
				amount = tokens(10);
				// Approve the exchange address as the token's spender
				await token.approve(exchange.address,amount, { from : user1 });	

				// Transfer tokens directly from the deploy address into the user1 address
				await token.transfer(user1,tokens(100), { from : deployer });
				//console.log("User 1 balance: " + await token.balanceOf(user1));			
			})

			it('Verify the approved allowance for the Exchange', async () => {
				const result = await token.allowance(user1,exchange.address);
				result.toString().should.equal(amount.toString());
				//console.log("Remaining allowance: " + result.toString());
			})

			it('Transfer tokens to the user address, deposit tokens into the exchange & verify the balance', async () => {
				let balance;

				// Deposit tokens from the user1 address into the exchange
				const result = await exchange.depositToken(token.address,amount, { from : user1 });

				// Check tokens balance on the token address
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString());

				// check tokens balance on exchange
				balance = await exchange.tokens(token.address,user1);
				balance.toString().should.equal(amount.toString())
			})

			it('Verify the Deposit event was emitted', async () => {
				let balance;

				// Deposit tokens from the user1 address into the exchange
				const result = await exchange.depositToken(token.address,amount, { from : user1 });

				// check tokens balance on exchange
				balance = await exchange.tokens(token.address,user1);
				balance.toString().should.equal(amount.toString())

				const logs = result.logs[0];
				logs.event.toString().should.equal('Deposit');
				const event = logs.args;
				event.token.toString().should.equal(token.address.toString(), 'token address is correct');
				event.user.toString().should.equal(user1.toString(), 'user address is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal(balance.toString(), 'balance in exchange is correct');

			})

		})

		describe('Failure', () => {
			let amount;

			beforeEach(async () => {
				amount = tokens(10);		
			})

			it('Reject a token deposit if user address does not have enough tokens', async () => {
				// Exchange is approved as the spender, but user1 does not have any tokens
				await token.approve(exchange.address,amount, { from : user1 });

				// Deposit tokens from the user1 address into the Exchange
				// Should fail because the user1 address does not have any tokens
				const result = await exchange.depositToken(token.address,amount, { from : user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

			it('Reject a token deposit if exchange is not approved as the spender', async () => {

				// transfer tokens from the deployer to user1 address - Even though the user1 has tokens, the exchange has not been approved
				await token.transfer(user1,tokens(100), { from : deployer });

				// Deposit tokens from the user1 address into the Exchange
				// Should fail because the exchange address is not approved as the spender
				const result = await exchange.depositToken(token.address,amount, { from : user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

			it('Reject an attempt to deposit Ether', async () => {
				await exchange.depositToken(ETHER_ADDRESS,amount,{ from : user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

		})
	}) // depositting tokens

	describe('Depositing Ethers', () => {

		describe('Success', () => {
			let amount;
			let result;

			beforeEach(async () => {
				amount = ethers(1);		
				result = await exchange.depositEther({ from : user1 , value: amount});
			})

			it('Tracks the Ether deposit', async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS,user1);
				balance.toString().should.equal(amount.toString());
			})

			it('Verify the Deposit event was emitted', async () => {
				let balance;

				// check tokens balance on exchange
				balance = await exchange.tokens(ETHER_ADDRESS,user1);
				balance.toString().should.equal(amount.toString())

				const logs = result.logs[0];
				logs.event.toString().should.equal('Deposit');
				const event = logs.args;
				event.token.toString().should.equal(ETHER_ADDRESS.toString(), 'ETHER_ADDRESS address is correct');
				event.user.toString().should.equal(user1.toString(), 'user address is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal(balance.toString(), 'balance in exchange is correct');

			})
		})

		describe('fallback', () => {
			it('Reverts when Ether is sent by the user', async () => {
				await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

		})	
	}) // depositting Ethers

	describe('withdrawing Ether', async () => {

		describe('Success', async () => {
			let amount 
			let result

			beforeEach(async () => {
				amount = ethers(1);
				await exchange.depositEther({ from: user1, value: amount });
			})

			it('Validate Ethers were withdraw successfully', async () => {
				await exchange.withdrawEther(amount, { from: user1 });
				result = await exchange.balanceOf(ETHER_ADDRESS,user1);
				// balance after withdrawing 1 Ether should be 0
				result.toString().should.equal('0');

			})

			it('Validate withdraw event was emitted', async () => {
				result = await exchange.withdrawEther(amount, { from: user1 });

				const logs = result.logs[0];
				logs.event.toString().should.equal('Withdraw');
				const event = logs.args;
				event.token.toString().should.equal(ETHER_ADDRESS.toString(), 'ETHER_ADDRESS address is correct');
				event.user.toString().should.equal(user1.toString(), 'user address is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				// balance after withdrawing 1 Ether should be 0
				event.balance.toString().should.equal('0', 'balance in exchange is correct');

			})
		})

		describe('Failure', async () => {
			it('validate that withdrawEther() fails if user does not have enough Ether balance', async () => {
				let amount = ethers(1);
				// At this moment, user1 does not have any Ether on its account
				await exchange.withdrawEther(amount, { from : user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})
		})

	}) // withdrawing Ether


	describe('withdrawing tokens', async () => {

		describe('Success', async () => {
			let amount 
			let result 

			beforeEach(async () => {
				amount = tokens(10)

				// Transfer tokens from the deployer to the user1
				await token.transfer(user1,amount, { from : deployer })
				// Approve the exchange address as the spender of the tokens from user1
				await token.approve(exchange.address,amount, { from : user1 })

				// Deposit tokens from the user1 into the exchange
				await exchange.depositToken(token.address,amount, { from : user1 })

				// Withdraw Token
				result = await exchange.withdrawToken(token.address, amount, { from : user1 })
			})

			it('Validate Token was withdraw successfully', async () => {
				const balance = await exchange.balanceOf(token.address,user1)
				balance.toString().should.equal('0');

			})

			it('Validate withdraw event was emitted', async () => {
				const logs = result.logs[0];
				logs.event.toString().should.equal('Withdraw');
				const event = logs.args;
				event.token.toString().should.equal(token.address.toString(), 'Token address address is correct');
				event.user.toString().should.equal(user1.toString(), 'user address is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				// balance after withdrawing 1 Ether should be 0
				event.balance.toString().should.equal('0', 'balance in exchange is correct');
			})

		})

		describe('Failure', async () => {
			let amount = tokens(10);

			it('Rejects Ether withdraws', async () => {
				await exchange.withdrawToken(ETHER_ADDRESS,amount, { from : user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

			it('Validate a withdraw fails if the user token exchange balance does not have enough balance', async () => {
				await exchange.withdrawToken(token.address,amount, { from : user1 }).should.be.rejectedWith(EVM_ERROR_REVERT);
			})

		})

	}) // withdrawing tokens
	

	describe('Check token balance in exchange', async () => {
		let amount 
		let result
		beforeEach(async () => {
			amount = ethers(1);
			await exchange.depositEther({ from: user1, value: amount });
		})

		it('Check balance after depositing Ethers', async () => {
			result = await exchange.balanceOf(ETHER_ADDRESS,user1)
			result.toString().should.equal(amount.toString());
		})

		it('Check balance after withdrawing Ethers', async () => {
			await exchange.withdrawEther(amount, { from: user1 });

			// After the withdraw, the Ether balance should be 0
			result = await exchange.balanceOf(ETHER_ADDRESS,user1)
			result.toString().should.equal('0');
		})
	}) // Check token balance in exchange


	describe('making orders', async () => {
		let result;
		beforeEach(async () => {
			result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ethers(1), { from : user1 });
		})

		describe('succes', async () => {

			it('tracks newly created order, validate the orderId', async () => {
				const orderCount = await exchange.orderCount();
				orderCount.toString().should.equal('1');
			})

			it('Validate the order attributes', async () => {
				const order = await exchange.orders('1');
				//console.log(order);
				order.id.toString().should.equal('1', 'Id is Correct');
				order.user.toString().should.equal(user1, 'User is correct');
				order.tokenGet.toString().should.equal(token.address, 'tokenGet address is correct');
				order.amountGet.toString().should.equal(tokens(1).toString(), 'amoutGet is correct');
				order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive address is correct');
				order.amountGive.toString().should.equal(ethers(1).toString(), 'amountGive is correct');	
				order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');		
			})

			it('Validate the Order event was emmited', async () => {
				const logs = result.logs[0];
				logs.event.toString().should.equal('Order');

				const order_logs = logs.args;
				order_logs.orderId.toString().should.equal('1', 'orderId is correct');
				order_logs.user.toString().should.equal(user1, 'user is correct');
				order_logs.tokenGet.toString().should.equal(token.address.toString(), 'tokenGet is valid');
				order_logs.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
			})

		})

	}) // making orders
*/

	describe('order actions', async () => {

		beforeEach(async () => {
			// user1 deposits ether in the exchange
			await exchange.depositEther({ from : user1, value : ethers(1) });
			// deployer transfers some tokens to user2
			await token.transfer(user2, tokens(100),{ from : deployer });
			// user 2 approves & deposits tokens in the exchange
			await token.approve(exchange.address,tokens(2), { from : user2 });
			await exchange.depositToken(token.address,tokens(2), { from : user2 });
			// user1 makes an order to exchange ETHERS for tokens - The user will give ethers and receive tokens
			await exchange.makeOrder(token.address,tokens(1),ETHER_ADDRESS,ethers(1), { from : user1 });
		})

		describe('filling orders', async () => {
			
			describe('success', async () => {
				let result;

				beforeEach(async () => {
					result = await exchange.fillOrder('1', {from:user2});
				})
				
				it('Validates that the trade was executed & the fees were charged properly', async () => {
					let balanceOf
					// Balance of the user1 of the tokens that were swapped for ETHERS
					balanceOf = await exchange.balanceOf(token.address,user1);
					balanceOf.toString().should.equal(tokens(1).toString(), 'User1 receives 1 tokens');

					// Balance of the user2 of the tokens that were swapped for ETHERS - Remaining balance is calculated by deducting the amount of token that were swapped + the fees
					balanceOf = await exchange.balanceOf(token.address,user2);
					balanceOf.toString().should.equal(tokens(0.9).toString(), 'User2 sent 1 tokens and payed 1 token as fee');	

					// Balance of the feeAccount of the tokens that were swapped for ETHERS
					balanceOf = await exchange.balanceOf(token.address,feeAccount);
					balanceOf.toString().should.equal(tokens(0.1).toString(), 'Fee for this order was 1 token');	// fee generated for doing the swap
				
					// Ether's balance of user1 - This balance is the amount of ETHERS that the user has deposited in the exchange
					balanceOf = await exchange.balanceOf(ETHER_ADDRESS,user1);
					balanceOf.toString().should.equal(ethers(0).toString(), 'ETHERS remaining in the users1 balance = 0');

					// Ether's balance of user2
					balanceOf = await exchange.balanceOf(ETHER_ADDRESS,user2);
					balanceOf.toString().should.equal(ethers(1).toString(), 'ETHERS in the users2 balance = 1');
				})

				it('Validate that order1 was marked as filled', async () => {
					const orderFilled = await exchange.orderFilled('1');
					orderFilled.should.equal(true);
				})

				it('Validate the Trade event was emmited', async () => {
					const logs = result.logs[0];
					logs.event.toString().should.equal('Trade');

					const trade_logs = logs.args;
					trade_logs.orderId.toString().should.equal('1', 'orderId is correct');
					trade_logs.user.toString().should.equal(user1, 'user is correct');
					trade_logs.tokenGet.toString().should.equal(token.address.toString(), 'tokenGet is valid');
					trade_logs.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is valid');
					trade_logs.tokenGive.toString().should.equal(ETHER_ADDRESS.toString(), 'tokenGive is valid');
					trade_logs.amountGive.toString().should.equal(ethers(1).toString(), 'amountGive is valid');
					trade_logs.userFill.toString().should.equal(user2, 'userFill is valid');
				})
			})

			describe('failure', async () => {

				it('Validates that an invalid order id is rejected', async () => {
					await exchange.fillOrder('2', { from : user2 }).should.be.rejectedWith(EVM_ERROR_REVERT);
				})

				it('Validate that already-filled orders are rejected', async () => {
					// Filling for the first time the orderId 1
					await exchange.fillOrder('1', { from : user2 }).should.be.fulfilled;

					//Trying to fill again the orderId, must be rejected
					await exchange.fillOrder('1', { from : user2 }).should.be.rejectedWith(EVM_ERROR_REVERT);
				})

				it('Validate that cancelled orders are rejected', async () => {
					// Cancelling orderId 1 from ther user1, the one who created the order
					await exchange.cancelOrder('1', { from : user1 }).should.be.fulfilled;

					//Trying to fill the orderId 1, but this order was already cancelled, must be rejected.
					await exchange.fillOrder('1', { from : user2 }).should.be.rejectedWith(EVM_ERROR_REVERT);
				})

			})
			

		}) // filling orders
/*
		describe('cancelling orders', async () => {

			describe('success', async () => {
				let cancel;

				beforeEach(async () => {
					cancel = await exchange.cancelOrder('1', {from:user1});
				})

				it('Validate if the order was cancelled succesfully', async () => {
					const cancelled = await exchange.orderCancelled('1');
					cancelled.toString().should.equal('true');
				})

				it('Validate the Cancel event was emmited', async () => {
					const logs = cancel.logs[0];
					logs.event.toString().should.equal('Cancel');

					const cancel_logs = logs.args;
					cancel_logs.orderId.toString().should.equal('1', 'orderId is correct');
					cancel_logs.user.toString().should.equal(user1, 'user is correct');
					cancel_logs.tokenGet.toString().should.equal(token.address.toString(), 'tokenGet is valid');
					cancel_logs.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
				})
			})

			describe('failure', async () => {

				it('rejects a cancellation of an invalid order_id', async () => {
					await exchange.cancelOrder('2', {from:user1}).should.be.rejectedWith(EVM_ERROR_REVERT);
				})

				it('Rejects unnauthorized attempt to cancel an order', async () => {
					await exchange.cancelOrder('1',{from:user2}).should.be.rejectedWith(EVM_ERROR_REVERT);
				})

			})

		}) // cancelling orders

*/


	}) // order actions

})