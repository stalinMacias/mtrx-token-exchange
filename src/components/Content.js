import React, { Component } from 'react'
import { connect } from 'react-redux'

import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

// Web3 will allows us to interact with the Smart Contracts
import Web3 from 'web3';

import {
  loadProvider,
  loadAllOrder,
  loadAllWithdraws,
  loadAllDeposits,
  subscribeToEvents
} from '../store/interactions'

import {
  exchangeSelector
} from '../store/selectors'

class Content extends Component {
  componentWillMount() {
    this.interactWithBlockchain(this.props)
  }

  async interactWithBlockchain(props) {
    const { exchange, dispatch } = props

    // Instantiate a new web3 connection to be able to interact with the Contracts
    const web3 = new Web3(window.ethereum);
    const provider = await loadProvider(dispatch);
    const latestBlock = await web3.eth.getBlockNumber()

    //await subscribeToEvents(exchange, dispatch)
    await loadAllOrder(exchange, dispatch,latestBlock,provider);
    await loadAllWithdraws(exchange, dispatch,latestBlock,provider)
    await loadAllDeposits(exchange,dispatch,latestBlock,provider)
  }

  render() {
    return (
      <div className="content">
        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
          <MyTransactions />
        </div>
        <Trades />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state)
  }
}

export default connect(mapStateToProps)(Content)
