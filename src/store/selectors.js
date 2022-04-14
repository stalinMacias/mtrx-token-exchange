import { get, reject,  groupBy, maxBy, minBy } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'

import {
	ETHER_ADDRESS,
	GREEN,
	RED,
	ethers,
	tokens
} from '../helpers'

const account = state => get(state, 'provider.account');
export const accountSelector = createSelector(account, (account) => {
	//console.log("account from the selector: ", account)
	return account
})

const token = state => get(state, 'web3.token');
export const tokenSelector = createSelector(token, (token) => {
	return token
})

const currentBlock = state => get(state,'web3.currentBlock');
export const currentBlockSelector = createSelector(currentBlock, (block) => {
	console.log("current block: ", block)
	return block
})

const tokenLoaded = state => get(state, 'web3.loaded');
export const tokenLoadedSelector = createSelector(tokenLoaded, (tokenLoaded) => { return tokenLoaded })  // Returns true or false if the token is loaded or not!

const exchangeLoaded = state => get(state, 'exchange.loaded');
export const exchangeLoadedSelector = createSelector(exchangeLoaded, (exchangeLoaded) => { return exchangeLoaded })

const exchange = state => get(state, 'exchange');
export const exchangeSelector = createSelector(exchange, (exchange) => {
	return exchange.exchange
})


export const contractsLoaded = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tokenLoaded, exchangeLoaded) => {
		return tokenLoaded && exchangeLoaded
	}
)

// ########################## All Orders ########################## //
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, loaded => { return loaded })

// selector to fetch allOrders from the state, and then format it and decorate it
const allOrders = state => get(state, 'exchange.allOrders.data', false)
export const allOrdersSelector = createSelector(allOrders,
	(orders) => {
		return orders
	}
)

// ############################################################################## //


// ########################## Fill Orders ########################## //
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false) // false by default
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => { return loaded })

// selector to fetch the fillOrders from the state, and then format it and decorate it
const filledOrders = state => get(state, 'exchange.filledOrders.data', []) // An empty array by default
export const filledOrdersSelector = createSelector(
	filledOrders,
	(orders) => {
		// Sort orders by ascending for price comparison
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)
		orders = decorateFilledOrders(orders)
		return orders
	}
)

// Receive the entire filledOrders collection and call the decorateOrder() sending each individual member of the collection for specific data processing to format each member with a basic formatting for any order
// Then, call the decorateFilledOrder() to apply some specific formatting regarding a filledOrder
const decorateFilledOrders = (orders) => {
	// Track previous order to compare history
	let previousOrder = orders[0] // Initialize the previousOrder with the first order member of the orders collection
	return (
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateFilledOrder(order, previousOrder)
			previousOrder = order // Update the previous order once it's decorated
			return order
		})
	)
}

// Decorate the order depending if the price of the previous order was high or lower - Specifically for filledOrders - Receive an individual member of the filledOrders collection
const decorateFilledOrder = (order, previousOrder) => {
	return ({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.orderId, previousOrder)
	})

}
// ############################################################################## //

// ########################## Cancel Orders ########################## //
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => { return loaded })

// selector to fetch the cancelOrders from the state, and then format it and decorate it
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
export const cancelledOrdersSelector = createSelector(cancelledOrders,
	(orders) => {
		return orders
	}
)
// ############################################################################## //

// ########################## OrderBook ########################## //
// # The order book can not be created without the Cancelled Orders, the Filled Orders and all the Orders 
const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => { return loaded })

// Create the Order Book by substracting the cancelledOrders & the filledOrders from allOrders === This result represents all the open orders
const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

	// Substract the filled & cancelled Orders from all the Orders, and return the result
	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.orderId === order.orderId)
		const orderCancelled = cancelled.some((o) => o.orderId === order.orderId)
		return (orderFilled || orderCancelled)
	})

	// Return only the openOrders, fill & cancel Orders have been already substracted
	return openOrders
}

export const orderBookSelector = createSelector(
	openOrders,
	(orders) => {
		// Decorate the Orders
		orders = decorateOrderBookOrders(orders)
		// Group the orders by orderType
		orders = groupBy(orders, 'orderType')

		// Fetch buy orders
		const buyOrders = get(orders, 'buy', []) // Will fetch from the openOrders object (after all the decorations) and retrieve only those set as buy

		// Fetch sell orders
		const sellOrders = get(orders, 'sell', []) // Will fetch from the openOrders object (after all the decorations) and retrieve only those set as sell

		// Sort buy orders & sell orders by tokenPrice
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
			sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}
		return orders
	}
)

const decorateOrderBookOrders = (orders) => {
	return (
		orders.map((order) => {
			// Apply general decoration to any order
			order = decorateOrder(order)
			// Apply decoration specific to an order of the orderBook collection
			order = decorateOrderBookOrder(order)
			return order
		})
	)
}

const decorateOrderBookOrder = (order) => {
	const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

	/*
	- Set an orderFillAction - orderFillAction is determined from the filler's user perspective
	- If the order is a buy order, it means that the user who fills the order will  sell Tokens
		- orderFillAction equals to Sell

	- If the order is a sell order, it means that the user who fills the order will  Buy Tokens
		- orderFillAction equals to Buy
	*/

	return ({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillAction: orderType === 'buy' ? 'sell' : 'buy'
	})
}
// ############################################################################## //

// ########################## MyFilled Orders - Orders the account is involved - Either as a filler or as the creator ########################## //

export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

export const myFilledOrdersSelector = createSelector(
	account,
	filledOrders,
	(account, orders) => {
		// Find our orders - Either if we created them or if we filled them
		orders = orders.filter((order) => {
			return (order.user.toLowerCase() === account || order.userFill.toLowerCase() === account)
		})
		// Sort our orders by date ascending
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)
		// Decorate orders - Add display attributes
		orders = decorateMyFilledOrders(orders, account)
		return orders
	}
)

const decorateMyFilledOrders = (orders, account) => {
	return (
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyFilledOrder(order, account)
			return order
		})
	)
}

const decorateMyFilledOrder = (order, account) => {
	// Validate that the order was created by ... If not it means that we filled that order
	const myOrder = order.user === account

	// Determine the orderType
	let orderType = ''
	if (myOrder) {
		order.tokenGive === ETHER_ADDRESS ? orderType = 'buy' : orderType = 'sell'
	} else {
		order.tokenGive === ETHER_ADDRESS ? orderType = 'sell' : orderType = 'buy'
		/*
		- An User opens an Order giving ETHERs and asking for Tokens
		- I'm filling and order where I'm giving Tokens, and I'll receive ETHERs; From my perspective it is a sell order, because I'm giving my tokens

		- An User opens an Order giving Tokens and asking for ETHERs
		- I'm filling and order where I'm giving ETHERs , and I'll receive Tokens; From my perspective it is a buy order, because I'm receiving tokens
		*/
	}

	return {
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderSign: (orderType === 'buy' ? '+' : '-')
	}
}

// ############################################################################## //

// ########################## Cancelling Orders ########################## //
const orderCancellingLoaded = state => get(state, 'exchange.orderCancelling', false)
export const orderCancellingSelector = createSelector(orderCancellingLoaded, (status) => { return status })

// ########################## Filling Orders ########################## //
const orderFillingLoaded = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFillingLoaded, (status) => { return status })


// ########################## MyOpen Orders - All orders that an account has active in the Order Book ########################## //

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const myOpenOrdersSelector = createSelector(
	account,
	openOrders,
	(account, orders) => {
		// Filter the openOrders collection to get only the orders that were created by us
		orders = orders.filter((order) => order.user.toLowerCase() === account)
		// Decorate Orders - Add display attributes
		orders = decorateMyOpenOrders(orders, account)
		// Sort myOpenOrders by date descending - The newest first
		orders = orders.sort((a, b) => b.timestamp - a.timestamp)
		return orders
	}
)

const decorateMyOpenOrders = (orders, account) => {
	return (
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyOpenOrder(order)
			return order
		})
	)
}

const decorateMyOpenOrder = (order) => {
	let orderType = ''
	order.tokenGive === ETHER_ADDRESS ? orderType = 'buy' : orderType = 'sell'

	return {
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED)
	}
}
// ############################################################################## //

// ########################## Price Chart Selectors - Format Data to be displayed in the price chart component ########################## //
export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const priceChartSelector = createSelector(
	filledOrders,
	(orders) => {
		// Sort orders by ascending date
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)
		orders = orders.map((order) => {
			order = decorateOrder(order)
			return order
		})

		// Get the last 2 orders
		let finalOrder, secondLastFinalOrder
		[secondLastFinalOrder, finalOrder] = orders.slice(orders.length - 2, orders.length)
		// Get the last price
		const lastPrice = get(finalOrder, 'tokenPrice')
		// Get the secondLast price
		const secondLastPrice = get(secondLastFinalOrder, 'tokenPrice')


		return {
			lastPrice,
			lastPriceChange: (lastPrice > secondLastPrice ? '+' : '-'),
			series: [{
				data: buildGraphData(orders)
			}]
		}

	})

const buildGraphData = (orders) => {
	// Group the orders by hour for the graph
	orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

	// Get each hour where data exists
	const hours = Object.keys(orders)

	// Create the graphData object
	const graphData = hours.map((hour) => {
		// Fetch all orders from current hour
		const group = orders[hour]

		// Calculate price values - open, high, low, close
		const open = group[0]
		const high = maxBy(group, 'tokenPrice')
		const low = minBy(group, 'tokenPrice')
		const close = group[group.length - 1]

		return {
			x: new Date(hour),
			y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		}
	})

	// Is is a must to return only the graphData object, if we add {} to the return statement, JS will convert it to a string of graphData object - We don-t need that data structure
	return graphData

}


// ########################## Decorating Any Type of Order ########################## //
// Receive a member of the entire collection, process & manipulates the data and return the same member with all the new changes applied - Basic formatting for any Order, cancelOrder, filledOrder, order
const decorateOrder = (order) => {
	let etherAmount
	let tokenAmount
	if (order.tokenGive === ETHER_ADDRESS) {
		etherAmount = order.amountGive
		tokenAmount = order.amountGet
	} else {
		etherAmount = order.amountGet
		tokenAmount = order.amountGive
	}

	const precision = 100000;
	let tokenPrice = (etherAmount / tokenAmount)
	tokenPrice = Math.round(tokenPrice * precision) / precision

	return {
		...order,
		etherAmount: ethers(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
	}
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	if (previousOrder.orderId === orderId) {
		return GREEN
	}
	// GREEN if order price is higher than previous order   <---> success class in bootstrap
	// RED if order price is lower than previous order 		<---> danger class in bootstrap
	return (previousOrder.tokenPrice < tokenPrice) ? GREEN : RED
}

// ############################################################################## //
// ############################################################################## //

// ########################## allBalances & individual balances ########################## //
const formatBalance = (balance) => {
	balance = ethers(balance)
	balance = Math.round(balance * 100) / 100 // Round up to 2 decimals
	return balance
}

const etherBalance = state => get(state, 'web3.etherBalance', 0)
export const etherBalanceSelector = createSelector(etherBalance,
	(balance) => {
		return formatBalance(balance)
	}
)

const etherBalanceExchange = state => get(state, 'exchange.etherBalanceExchange', 0)
export const etherBalanceExchangeSelector = createSelector(etherBalanceExchange,
	(balance) => {
		return formatBalance(balance)
	}
)

const tokenBalance = state => get(state, 'web3.tokenBalance', 0)
export const tokenBalanceSelector = createSelector(tokenBalance,
	(balance) => {
		return formatBalance(balance)
	}
)

const tokenBalanceExchange = state => get(state, 'exchange.tokenBalanceExchange', 0)
export const tokenBalanceExchangeSelector = createSelector(tokenBalanceExchange,
	(balance) => {
		return formatBalance(balance)
	}
)

const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, bl => bl)



// ################################################## Withdraws ################################################## //

// ########################## allWithdraws & MyWithdraws - All the Token's withdrawals that an account has done ########################## //

const allWithdrawsLoaded = state => get(state, 'exchange.allWithdraws.loaded', false)

// fetch allWithdraws from the redux store (application's state)
const allWithdraws = state => get(state, 'exchange.allWithdraws.data', [])

export const myWithdrawsLoadedSelector = createSelector(allWithdrawsLoaded, loaded => loaded)

const tokenAddress = state => get(state, 'web3.token.options.address', null);
//ETHER_ADDRESS

// Selector to fetch all the Token withdraws of an specific user, format it & let the data ready to be consumed from any component
export const myTokenWithdrawsSelector = createSelector(
	account,
	allWithdraws,
	tokenAddress,
	(account, withdraws, tokenAddress) => {
		// Filter the withdraws collection to get only the withdraws that belongs to us
		const myWithdraws = withdraws.filter((withdraw) => withdraw.user.toLowerCase() === account)

		// Filter the withdraws collection to get only the withdraws of Tokens
		let myTokenWithdraws = myWithdraws.filter((withdraw) => withdraw.token.toLowerCase() === tokenAddress.toLowerCase())

		// Decorate withdraws
		myTokenWithdraws = decorateWithdraws(myTokenWithdraws,"token")

		// Sort by date descending - The newest withdraws first
		myTokenWithdraws = myTokenWithdraws.sort((a, b) => b.timestamp - a.timestamp)
		return myTokenWithdraws
	}
)

// Selector to fetch all the ETHER withdraws of an specific user, format it & let the data ready to be consumed from any component
export const myEtherWithdrawsSelector = createSelector(
	account,
	allWithdraws,
	(account, withdraws) => {
		// Filter the withdraws collection to get only the withdraws that belongs to us
		const myWithdraws = withdraws.filter((withdraw) => withdraw.user.toLowerCase() === account)

		// Filter the withdraws collection to get only the withdraws of Tokens
		let myEtherWithdraws = myWithdraws.filter((withdraw) => withdraw.token.toLowerCase() === ETHER_ADDRESS.toLowerCase())

		// Decorate withdraws
		myEtherWithdraws = decorateWithdraws(myEtherWithdraws,"ether")

		// Sort by date descending - The newest withdraws first
		myEtherWithdraws = myEtherWithdraws.sort((a, b) => b.timestamp - a.timestamp)
		return myEtherWithdraws
	}
)


const decorateWithdraws = (withdraws,withdraw_type) => {
	return (
		withdraws.map((withdraw) => {
			withdraw = decorateWithdraw(withdraw,withdraw_type)
			return withdraw
		})
	)
}

const decorateWithdraw = (withdraw,withdraw_type) => {
	let amount
	withdraw_type === 'token' ? amount = tokens(withdraw.amount) : amount = ethers(withdraw.amount)
	return {
		...withdraw,
		amount,
		withdrawTypeClass: GREEN,
		formattedTimestamp: moment.unix(withdraw.timestamp).format('h:mm:ss a M/D')
	}
}

// ############################################################################## //

// ################################################## Deposits ################################################## //

// ########################## allDeposits & MyDeposits - All the Token's deposits that an account has done ########################## //
const allDepositsLoaded = state => get(state, 'exchange.allDeposits.loaded', false)
export const myDepositsLoadedSelector = createSelector(allDepositsLoaded,(status) => { return status })

// fetch allDeposits from the redux store (application's state)
const allDeposits = state => get(state, 'exchange.allDeposits.data', [])

// Selector to get only the token deposits that an accouns has done
export const myTokenDepositsSelector = createSelector(
	account,
	allDeposits,
	tokenAddress,
	(account, deposits, tokenAddress) => {
		// Filter the deposits collection to get only the deposits that belongs to us
		const myDeposits = deposits.filter((deposit) => deposit.user.toLowerCase() === account)

		// Filter the myDeposits collection to get only the deposits of Tokens
		let myTokenDeposits = myDeposits.filter((deposit) => deposit.token.toLowerCase() === tokenAddress.toLowerCase())

		// Decorate myTokenDeposits
		myTokenDeposits = decorateDeposits(myTokenDeposits,"token")

		// Sort by date descending - The newest myTokenDeposits first
		myTokenDeposits = myTokenDeposits.sort((a, b) => b.timestamp - a.timestamp)

		return myTokenDeposits
})

// Selector to get only the ETHTER deposits that an accouns has done
export const myEtherDepositsSelector = createSelector(
	account,
	allDeposits,
	(account, deposits) => {
		// Filter the deposits collection to get only the deposits that belongs to us
		const myDeposits = deposits.filter((deposit) => deposit.user.toLowerCase() === account)

		// Filter the myDeposits collection to get only the deposits of ETHERs
		let myEtherDeposits = myDeposits.filter((deposit) => deposit.token.toLowerCase() === ETHER_ADDRESS.toLowerCase())

		// Decorate myEtherDeposits
		myEtherDeposits = decorateDeposits(myEtherDeposits,"ether")

		// Sort by date descending - The newest deposits first
		myEtherDeposits = myEtherDeposits.sort((a, b) => b.timestamp - a.timestamp)

		return myEtherDeposits

})

const decorateDeposits = (deposits,deposit_type) => {
	return (
		deposits.map((deposit) => {
			deposit = decorateDeposit(deposit,deposit_type)
			return deposit
		})
	)
}

const decorateDeposit = (deposit,deposit_type) => {
	let amount
	deposit_type === 'token' ? amount = tokens(deposit.amount) : amount = ethers(deposit.amount)
	return {
		...deposit,
		amount,
		depositTypeClass: GREEN,
		formattedTimestamp: moment.unix(deposit.timestamp).format('h:mm:ss a M/D')
	}
}

// ########## Selectors to get the data uploaded to the redux store directly from the component ################# //

const etherDepositAmountChange = state => get(state, 'exchange.etherDepositAmountChange', null)
export const etherDepositAmountChangeSelector = createSelector(etherDepositAmountChange, (amount) => { return amount })

const etherWithdrawAmountChange = state => get(state, 'exchange.etherWithdrawAmountChange', null)
export const etherWithdrawAmountChangeSelector = createSelector(etherWithdrawAmountChange, (amount) => { return amount })

const tokenDepositAmountChange = state => get(state, 'exchange.tokenDepositAmountChange', null)
export const tokenDepositAmountChangeSelector = createSelector(tokenDepositAmountChange, (amount) => { return amount })

const tokenWithdrawAmountChange = state => get(state, 'exchange.tokenWithdrawAmountChange', null)
export const tokenWithdrawAmountChangeSelector = createSelector(tokenWithdrawAmountChange, (amount) => { return amount })


// ############################################################################## //
// ############################################################################## //

// ########################## Buy & Sell Orders  ########################## //
const buyOrder = state => get(state,'exchange.buyOrder', {})
export const buyOrderSelector = createSelector(buyOrder, order => order )

const sellOrder = state => get(state,'exchange.sellOrder', {})
export const sellOrderSelector = createSelector(sellOrder, order => order )