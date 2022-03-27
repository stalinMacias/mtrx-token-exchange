// detectEthereumProvider will help us to handle the metamask information, such as, network, user accounts, connection the user to metamask
import detectEthereumProvider from '@metamask/detect-provider';

// import the Token abi
import Token from '../abis/Token.json';
// import the Exchange abi
import Exchange from '../abis/Exchange.json'

import {
  providerLoaded,
  providerNetworkId,
  providerAccount,
  web3LoadToken,
  // Orders
  exchangeLoadExchange,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  allWithdrawsLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled,
  // Balances
  etherBalanceLoaded,
  etherBalanceExchangeLoaded,
  tokenBalanceLoaded,
  tokenBalanceExchangeLoaded,
  balancesLoaded,
  balancesLoading,
  // Deposits
  depositCompleted,
  allDepositsLoaded,
  // Withdraws
  withdrawCompleted,
  // Buy Order
  buyOrderMaking,
  // Sell Order
  sellOrderMaking,
  // Order Made - To update the making flag to false
  orderMade
} from './actions'
import { ETHER_ADDRESS } from '../helpers';

////////////////////// provider dispatcher //////////////////////

export const loadProvider = async (dispatch) => {
  const provider = await detectEthereumProvider()
  dispatch(providerLoaded(provider))
  return provider
}

export const getNetworkId = async (provider, dispatch) => {
  /**********************************************************/
  /* Handle chain (network) and chainChanged (per EIP-1193) *      
  /**********************************************************/
  const networkId = await provider.request({ method: 'eth_chainId' });
  //console.log("Network: ", networkId ) //Network:  0x38 reffers to the BSC

  dispatch(providerNetworkId(networkId));
  return networkId;
}

export const getAccount = async (provider, dispatch) => {
  const accounts = await provider.request({ method: 'eth_accounts' });
  const account = accounts[0]
  dispatch(providerAccount(account));
  return account;
}


////////////////////// web3 dispatcher //////////////////////

export const loadToken = async (web3, networkVersion, dispatch) => {
  try {
    // Creating a new Contract Instance for the Token
    const abi = Token.abi;

    // Will get all the networks where the Token is deployed
    const token_networks = Token.networks;

    // Get the token address in a specific network
    const token_address = token_networks[networkVersion].address;

    // Instantiating the Token's contract using the web3 library
    const token = await new web3.eth.Contract(abi, token_address);

    dispatch(web3LoadToken(token));
    return token;
  } catch (error) {
    console.log("Token Smart Contract not detected on the current network. Please select another network within MetaMask!");
    return null
  }
}


////////////////////// exchange dispatcher //////////////////////

export const loadExchange = async (web3, networkVersion, dispatch) => {
  try {
    // Creating a new Contract instance for the Exchange
    const abi = Exchange.abi;
    // Will get all the networks where the Exchange is deployed
    const exchange_networks = Exchange.networks;

    // Get the exchange address in a specific network
    const exchange_address = exchange_networks[networkVersion].address;

    // Instantiating the Exchange contract using the web3 library
    const exchange = await new web3.eth.Contract(abi, exchange_address);

    dispatch(exchangeLoadExchange(exchange));
    return exchange;
  } catch (error) {
    console.log("Exchange Smart Contract not detected on the current network. Please select another network within MetaMask!");
    return null
  }

}

////////////////////// subscribeToEvents //////////////////////

// Gets trigger each time the Event is executed
export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues))
  })

  exchange.events.Trade({}, (error, event) => {
    dispatch(orderFilled(event.returnValues))
  })

  exchange.events.Deposit({}, (error, event) => {
    dispatch(depositCompleted(event.returnValues))
  })

  exchange.events.Withdraw({}, (error, event) => {
    dispatch(withdrawCompleted(event.returnValues))
  })

  exchange.events.Order({}, (error, event) => {
    dispatch(orderMade(event.returnValues))
  })

}

////////////////////// loadAllOrder //////////////////////
/*
  * To load all the Orders we need to fetch their corresponding Events, because Orders by themselves are an action that occured
*/
export const loadAllOrder = async (exchange, dispatch) => {
  // Fetch cancelled orders with the "Cancel" event stream
  const cancelStream = await exchange.getPastEvents("Cancel", { fromBlock: 0, toBlock: 'latest' });
  // Format cancelledOrders
  const cancelledOrders = cancelStream.map((event) => event.returnValues);
  // Dispatch cancelledOrders to the redux store (update the application state)
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  // Fetch filled orders with the "Trade" event stream
  const tradeStream = await exchange.getPastEvents("Trade", { fromBlock: 0, toBlock: 'latest' });
  // Format filledOrders
  const filledOrders = tradeStream.map((event) => event.returnValues);
  // Dispatch filledOrders to the redux store (update the application state)
  dispatch(filledOrdersLoaded(filledOrders));

  // Fetch all orders with the "Order" event stream
  const orderStream = await exchange.getPastEvents("Order", { fromBlock: 0, toBlock: 'latest' });
  // Format allOrders
  const allOrders = orderStream.map((event) => event.returnValues);
  // Dispatch allOrders to the redux store (update the application state)
  dispatch(allOrdersLoaded(allOrders));
  //console.log("All Orders have been loaded to the redux store")
}

export const cancelOrder = async (dispatch, exchange, order, account) => {
  exchange.methods.cancelOrder(order.orderId).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(orderCancelling())
    })
    .on('error', (error) => {
      console.log("Error while canceling the transaction: ", error)
      if (error.code === 4001) {
        window.alert("User aborted the process to cancell the Order")
      } else {
        window.alert("Error while cancelling the Order")
      }
    })
}

export const fillOrder = async (dispatch, exchange, order, account) => {
  exchange.methods.fillOrder(order.orderId).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(orderFilling())
    })
    .on('error', (error) => {
      console.log("Error while canceling the transaction: ", error)
      if (error.code === 4001) {
        window.alert("User aborted the process to fill and Order")
      } else {
        window.alert("Error while filling an Order")
      }
    })
}

////////////////////// loadBalances //////////////////////
/*
  * To load the Balances, we need to fetch the data from the balanceOf() function of the smart contracts
*/

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
  // ETHER Balance in wallet
  const etherBalance = await web3.eth.getBalance(account)
  dispatch(etherBalanceLoaded(etherBalance))

  // ETHER Balance in exchange
  const etherBalanceExchange = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
  dispatch(etherBalanceExchangeLoaded(etherBalanceExchange))

  // Token Balance in the Wallet for the current user
  const tokenBalance = await token.methods.balanceOf(account).call()
  dispatch(tokenBalanceLoaded(tokenBalance))

  // Token Balance in the Exchange for the current user
  const tokenBalanceExchange = await exchange.methods.balanceOf(token._address, account).call()
  dispatch(tokenBalanceExchangeLoaded(tokenBalanceExchange))

  // Dispatch the balancesLoaded() action
  dispatch(balancesLoaded())
}

/// Deposit & Withdraw ETHERs ////
export const depositEther = (dispatch, exchange, web3, etherDepositAmount, account) => {
  exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(etherDepositAmount, 'ether') })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error', (error) => {
      console.log(error)
      if (error.code === 4001) {
        window.alert("The user canceled the transaction to deposit ETHERs in the Exchange")
      } else {
        window.alert("There was en error while depositing ETHERs into the Exchange!")
      }
    })
}

export const withdrawEther = (dispatch, exchange, web3, etherWithdrawAmount, account) => {
  exchange.methods.withdrawEther(web3.utils.toWei(etherWithdrawAmount, 'ether')).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error', (error) => {
      console.log(error)
      if (error.code === 4001) {
        window.alert("The user canceled the transaction to withdraw ETHERs from the Exchange")
      } else {
        window.alert("There was en error while withdrawing ETHERs from the Exchange!")
      }
    })
}



/// Deposit & Withdraw Tokens ////
export const depositToken = (dispatch, exchange, web3, token, tokenDepositAmount, account) => {
  const amount = web3.utils.toWei(tokenDepositAmount, 'ether')
  // The spender will be the exchange
  token.methods.approve(exchange._address, amount).send({ from: account })     //Invoking the approve() method from the Token smart contract - The allowance to the spender (Exchange) will be increased
    .on('transactionHash', (hash) => {
      exchange.methods.depositToken(token._address, amount).send({ from: account })                                  //Invoking the depositToken() method from the Exchange smart contract - The tokens will be taken from the user's balance (Different than the wallet) and put them into the Exchange
        .on('transactionHash', (hash) => {
          // Once the Tokens have been deposited, the balances are updated...
          dispatch(balancesLoading())
        })
        .on('error', (error) => {
          console.log("Error while depositing tokens: ", error)
          window.alert("An error occured while depositing Tokens")
        })
    })
    .on('error', (error) => {
      console.log(error)
      if (error.code === 4001) {
        window.alert("The user canceled the transaction to deposit Tokens in the Exchange")
      } else {
        window.alert("There was en error while approving Tokens to be depositted into the Exchange!")
      }
    })
}

export const withdrawToken = (dispatch, exchange, web3, token, tokenWithdrawAmount, account) => {
  exchange.methods.withdrawToken(token._address, web3.utils.toWei(tokenWithdrawAmount, 'ether')).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error', (error) => {
      console.log(error)
      if (error.code === 4001) {
        window.alert("The user canceled the transaction to withdraw Tokens from the Exchange")
      } else {
        window.alert("There was en error while withdrawing Tokens from the Exchange!")
      }
    })
}

/// Buy & Sell Orders ////
export const makeBuyOrder = (dispatch,exchange,token,web3,order,account) => {
  const tokenGet = token._address
  const amountGet = web3.utils.toWei(order.amount, 'ether')
  const tokenGive = ETHER_ADDRESS
  const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

  exchange.methods.makeOrder(tokenGet,amountGet,tokenGive,amountGive).send( { from: account } )
  .on('transactionHash', (hash) => {
    dispatch(buyOrderMaking())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert("Error while making a buy order")
  })
}

export const makeSellOrder = (dispatch,exchange,token,web3,order,account) => {
  const tokenGet = ETHER_ADDRESS
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether') 
  const tokenGive = token._address
  const amountGive = web3.utils.toWei(order.amount, 'ether')

  exchange.methods.makeOrder(tokenGet,amountGet,tokenGive,amountGive).send( { from: account } )
  .on('transactionHash', (hash) => {
    dispatch(sellOrderMaking())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert("Error while making a sell order")
  })
}


////////////////////// loadAllWithdraws//////////////////////
export const loadAllWithdraws = async (exchange, dispatch) => {
  // Fetch withdraws with the "Withdraw" event stream
  const withdrawStream = await exchange.getPastEvents("Withdraw", { fromBlock: 0, toBlock: 'latest' });
  // Format withdraws
  const allWithdraws = withdrawStream.map((event) => event.returnValues);
  // Dispatch withdraws to the redux store
  dispatch(allWithdrawsLoaded(allWithdraws));
  //console.log("Withdraws have been loaded to the redux store")
}


////////////////////// loadAllDeposits //////////////////////
// It is triggered since the application is loaded for the first time & also each time a new deposit is made, the depositStream gets updated
export const loadAllDeposits = async (exchange,dispatch) => {
  // Fetch deposits with the "Deposit" event stream
  const depositStream = await exchange.getPastEvents("Deposit", { fromBlock: 0, toBlock: 'latest' });
  // Format deposits
  const allDeposits = depositStream.map((event) => event.returnValues);
  // Dispatch deposits to the redux store
  dispatch(allDepositsLoaded(allDeposits));
  //console.log("Withdraws have been loaded to the redux store")
}