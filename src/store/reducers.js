import { combineReducers } from 'redux';

function provider(state = {}, action) {
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return { ...state, connection: action.connection };

    case 'PROVIDER_NETWORK_ID':
      return { ...state, networkId: action.networkId };

    case 'PROVIDER_ACCOUNT':
      return { ...state, account: action.account };

    default:
      return state;
  }
}

function web3(state = {}, action) {
  switch (action.type) {
    case 'WEB3_TOKEN':
      return { ...state, loaded: true, token: action.token };

    case 'ETHER_BALANCE_LOADED':
      return { ...state, etherBalance: action.etherBalance };

    case 'TOKEN_BALANCE_LOADED':
      return { ...state, tokenBalance: action.tokenBalance }
    
    case 'CURRENT_BLOCK':
      return { ...state, currentBlock: action.block}

    default:
      return state;
  }
}


function exchange(state = {}, action) {
  let index, data

  switch (action.type) {

    case 'EXCHANGE_TOKEN':
      return { ...state, loaded: true, exchange: action.exchange };
    case 'CANCELLED_ORDERS_LOADED':
      return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders } }
    case 'FILLED_ORDERS_LODADED':
      return { ...state, filledOrders: { loaded: true, data: action.filledOrders } }
    case 'ALL_ORDERS_LODADED':
      return { ...state, allOrders: { loaded: true, data: action.allOrders } }
    case 'ALL_WITHDRAWS_LOADED':
      return { ...state, allWithdraws: { loaded: true, data: action.allWithdraws } }
    case 'ALL_DEPOSITS_LOADED':
      return { ...state, allDeposits: { loaded: true, data: action.allDeposits } }

    //Orders

    case 'ORDER_CANCELLING':
      return { ...state, orderCancelling: true }
    case 'ORDER_CANCELLED':
      return {
        ...state,
        orderCancelling: false,
        cancelledOrders: {
          ...state.cancelledOrders,
          data: [
            ...state.cancelledOrders.data,
            action.orderCancelled
          ]
        }
      }
    case 'ORDER_FILLING':
      return {
        ...state,
        orderFilling: true
      }

    case 'ORDER_FILLED':
      // Prevent duplicate orders
      index = state.filledOrders.data.findIndex(order => order.orderId === action.orderFilled.orderId);

      if (index === -1) {
        data = [...state.filledOrders.data, action.orderFilled]
      } else {
        data = state.filledOrders.data
      }

      return {
        ...state,
        orderFilling: false,
        filledOrders: {
          ...state.filledOrders,
          data
        }
      }

    //Balances

    case 'ETHER_BALANCE_EXCHANGE_LOADED':
      return {
        ...state,
        etherBalanceExchange: action.etherBalanceExchange
      }

    case 'TOKEN_BALANCE_EXCHANGE_LOADED':
      return {
        ...state,
        tokenBalanceExchange: action.tokenBalanceExchange
      }

    case 'BALANCES_LOADED':
      return {
        ...state,
        balancesLoading: false
      }

    case 'BALANCES_LOADING':
      return {
        ...state,
        balancesLoading: true
      }

    // Deposits

    case 'ETHER_DEPOSIT_AMOUNT_CHANGE':
      return {
        ...state,
        etherDepositAmountChange: action.amount
      }

    case 'DEPOSIT_COMPLETED':
      return {
        ...state,
        deposit: action.deposit,
        balancesLoading: false
      }


    case 'TOKEN_DEPOSIT_AMOUNT_CHANGE':
      return {
        ...state,
        tokenDepositAmountChange: action.amount
      }

    // Withdraws

    case 'ETHER_WITHDRAW_AMOUNT_CHANGE':
      return {
        ...state,
        etherWithdrawAmountChange: action.amount
      }

    case 'TOKEN_WITHDRAW_AMOUNT_CHANGE':
      return {
        ...state,
        tokenWithdrawAmountChange: action.amount
      }

    case 'WITHDRAW_COMPLETED':
      return {
        ...state,
        withdraw: action.withdraw,
        balancesLoading: false
      }

    // Buy Orders
    case 'BUY_ORDER_AMOUNT_CHANGE':
      return { ...state, buyOrder: { ...state.buyOrder, amount: action.amount } }

    case 'BUY_ORDER_PRICE_CHANGE':
      return { ...state, buyOrder: { ...state.buyOrder, price: action.price } }

    case 'BUY_ORDER_MAKING':
      return { ...state, buyOrder: { ...state.buyOrder, amount: null, price: null, making: true } }

    // Sell Orders
    case 'SELL_ORDER_AMOUNT_CHANGE':
      return { ...state, sellOrder: { ...state.sellOrder, amount: action.amount } }

    case 'SELL_ORDER_PRICE_CHANGE':
      return { ...state, sellOrder: { ...state.sellOrder, price: action.price } }

    case 'SELL_ORDER_MAKING':
      return { ...state, sellOrder: { ...state.sellOrder, amount: null, price: null, making: true } }

    // Order Made
    case 'ORDER_MADE':
      // Prevent duplicate orders
      index = state.allOrders.data.findIndex(order => order.orderId === action.order.orderId);

      if (index === -1) {
        data = [...state.allOrders.data, action.order]
      } else {
        data = state.allOrders.data
      }

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data
        },
        buyOrder: {
          ...state.buyOrder,
          making: false
        },
        sellOrder: {
          ...state.sellOrder,
          making: false
        }
      }

    default:
      return state;
  }
}

// Wrapping up all the reducers in the rootReducer
const rootReducer = combineReducers({
  provider: provider,
  web3,
  exchange
})

export default rootReducer;