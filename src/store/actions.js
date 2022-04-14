/// Provider ///

export function providerLoaded(connection) {
	return {
		type: 'PROVIDER_LOADED',
		connection:connection
	}
}

export function providerNetworkId(networkId) {
	return {
		type: 'PROVIDER_NETWORK_ID',
		networkId:networkId
	}
}

export function providerAccount(account) {
	return {
		type: 'PROVIDER_ACCOUNT',
		account:account
	}
}

/// Web3 ///
export function web3LoadToken(token) {
	return {
		type: 'WEB3_TOKEN',
		token:token
	}
}

export function currentBlockLoad(block) {
	return {
		type: 'CURRENT_BLOCK',
		block:block
	}
}

/// Exchange ///
export function exchangeLoadExchange(exchange) {
	return {
		type: 'EXCHANGE_TOKEN',
		exchange
	}
}

export function cancelledOrdersLoaded(cancelledOrders) {
	return {
		type: 'CANCELLED_ORDERS_LOADED',
		cancelledOrders
	}
}

export function filledOrdersLoaded(filledOrders) {
	return {
		type: 'FILLED_ORDERS_LODADED',
		filledOrders
	}
}

export function allOrdersLoaded(allOrders) {
	return {
		type: 'ALL_ORDERS_LODADED',
		allOrders
	}
}

export function allWithdrawsLoaded(allWithdraws) {
	return {
		type: 'ALL_WITHDRAWS_LOADED',
		allWithdraws
	}
}

export function orderCancelling() {
	return {
		type: 'ORDER_CANCELLING'
	}
}

export function orderCancelled(orderCancelled) {
	return {
		type: 'ORDER_CANCELLED',
		orderCancelled
	}
}

export function orderFilling() {
	return {
		type: 'ORDER_FILLING'
	}
}

export function orderFilled(orderFilled) {
	return {
		type: 'ORDER_FILLED',
		orderFilled
	}
}

// Balances

export function etherBalanceLoaded(etherBalance) {
	return {
		type: 'ETHER_BALANCE_LOADED',
		etherBalance
	}
}

export function etherBalanceExchangeLoaded(etherBalanceExchange) {
	return {
		type: 'ETHER_BALANCE_EXCHANGE_LOADED',
		etherBalanceExchange
	}
}

export function tokenBalanceLoaded(tokenBalance) {
	return {
		type: 'TOKEN_BALANCE_LOADED',
		tokenBalance
	}
}

export function tokenBalanceExchangeLoaded(tokenBalanceExchange) {
	return {
		type: 'TOKEN_BALANCE_EXCHANGE_LOADED',
		tokenBalanceExchange
	}
}

export function balancesLoaded() {
	return {
		type: 'BALANCES_LOADED'
	}
}

export function balancesLoading() {
	return {
		type: 'BALANCES_LOADING'
	}
}

// Deposits
export function etherDepositAmountChange(amount) {
	return {
		type: 'ETHER_DEPOSIT_AMOUNT_CHANGE',
		amount
	}
}

export function depositCompleted(deposit) {
	return {
		type: 'DEPOSIT_COMPLETED',
		deposit
	}
}

export function tokenDepositAmountChange(amount) {
	return {
		type: 'TOKEN_DEPOSIT_AMOUNT_CHANGE',
		amount
	}
}

export function allDepositsLoaded(allDeposits) {
	return {
		type: 'ALL_DEPOSITS_LOADED',
		allDeposits
	}
}



// Withdraws
export function etherWithdrawAmountChange(amount) {
	return {
		type: 'ETHER_WITHDRAW_AMOUNT_CHANGE',
		amount
	}
}

export function tokenWithdrawAmountChange(amount) {
	return {
		type: 'TOKEN_WITHDRAW_AMOUNT_CHANGE',
		amount
	}
}

export function withdrawCompleted(withdraw) {
	return {
		type: 'WITHDRAW_COMPLETED',
		withdraw
	}
}

// Buy Orders

export function buyOrderAmountChange(amount) {
	return {
		type: 'BUY_ORDER_AMOUNT_CHANGE',
		amount
	}
}

export function buyOrderPriceChange(price) {
	return {
		type: 'BUY_ORDER_PRICE_CHANGE',
		price
	}
}

export function buyOrderMaking() {
	return {
		type: 'BUY_ORDER_MAKING'
	}
}

// Sell Orders

export function sellOrderAmountChange(amount) {
	return {
		type: 'SELL_ORDER_AMOUNT_CHANGE',
		amount
	}
}

export function sellOrderPriceChange(price) {
	return {
		type: 'SELL_ORDER_PRICE_CHANGE',
		price
	}
}

export function sellOrderMaking() {
	return {
		type: 'SELL_ORDER_MAKING'
	}
}

// Order Made - Triggered when the Order event is triggered
export function orderMade(order) {
	return {
		type: 'ORDER_MADE',
		order 
	}
}