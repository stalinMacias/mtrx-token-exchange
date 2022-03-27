import React, { Component } from 'react'
import { connect } from 'react-redux'

import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

import {
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
    await loadAllOrder(exchange, dispatch);
    await subscribeToEvents(exchange, dispatch)
    await loadAllWithdraws(exchange, dispatch)
    await loadAllDeposits(exchange,dispatch)
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
