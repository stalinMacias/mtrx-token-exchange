
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'

// Web3 will allows us to interact with the Smart Contracts
import Web3 from 'web3';

import {
  makeBuyOrder,
  makeSellOrder
} from '../store/interactions'

import {
  exchangeSelector,
  tokenSelector,
  accountSelector,
  // Buy Order Selector
  buyOrderSelector,
  // Sell Order Selector
  sellOrderSelector
} from '../store/selectors'

import {
  buyOrderAmountChange,
  buyOrderPriceChange,
  sellOrderAmountChange,
  sellOrderPriceChange
} from '../store/actions'

const showForm = (props) => {

  // Instantiate a new web3 connection to be able to interact with the Contracts
  const web3 = new Web3(window.ethereum);

  const {dispatch,exchange,token,account,buyOrder,sellOrder,showBuyTotal,showSellTotal} = props

  return (
    <Tabs defaultActiveKey="buy" className="bg-dark text-white">

      <Tab eventKey="buy" title="Buy" className="bg-dark">
        <form onSubmit={(event) => {
          event.preventDefault()
          makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account)
        }}>
          <div className="form-group small">
            <label>Buy Amount (MTRX)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Buy Amount"
                onChange={(e) => dispatch(buyOrderAmountChange(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Buy Price (MTRX/ETH)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Buy Price"
                onChange={(e) => dispatch(buyOrderPriceChange(e.target.value))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm btn-block">Buy Order</button>
          { showBuyTotal ? <small>Total: {buyOrder.amount * buyOrder.price} ETH</small> : null }
        </form>
      </Tab>

      <Tab eventKey="sell" title="Sell" className="bg-dark">
        <form onSubmit={(event) => {
          event.preventDefault()
          makeSellOrder(dispatch, exchange, token, web3, sellOrder, account)
        }}>
          <div className="form-group small">
            <label>Sell Amount (MTRX)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Sell Amount"
                onChange={(e) => dispatch(sellOrderAmountChange(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Sell Price (MTRX/ETH)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white"
                placeholder="Sell Price"
                onChange={(e) => dispatch(sellOrderPriceChange(e.target.value))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm btn-block">Sell Order</button>
          { showSellTotal ? <small>Total: {sellOrder.amount * sellOrder.price} ETH</small> : null }
        </form>
      </Tab>

    </Tabs>
  )

}

class NewOrder extends Component {
  componentWillMount() {
    this.interactWithBlockchain()
  }

  async interactWithBlockchain() {
    // Instantiate a new web3 connection to be able to interact with the Contracts
    //const web3 = new Web3(window.ethereum);

    //const { dispatch, exchange, token, account } = this.props

  }


  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Create Orders
        </div>
        <div className="card-body">
          {this.props.showForm ? showForm(this.props) : <Spinner/>}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const buyOrder = buyOrderSelector(state)
  const sellOrder = sellOrderSelector(state)
  return {
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    buyOrder,
    sellOrder,
    showForm: !buyOrder.making && !sellOrder.making,
    showBuyTotal: buyOrder.amount && buyOrder.price,
    showSellTotal: sellOrder.amount && sellOrder.price
  }
}

export default connect(mapStateToProps)(NewOrder)
