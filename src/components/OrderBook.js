import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

import {
  orderBookLoadedSelector,
  orderBookSelector,
  exchangeSelector, 
  accountSelector,
  orderFillingSelector
} from '../store/selectors'

import {
  fillOrder
} from '../store/interactions'


const renderHeader = () => {
  return(
    <tr>
      <th>Time</th>
      <th>MTRX</th>
      <th>MTRX/ETH</th>
      <th>ETH</th>
    </tr>
  )
}

const renderOrder = (order,props) => {
  const { dispatch, exchange, account } = props
  return (
    <OverlayTrigger
      key={order.orderId}
      placement='auto'
      overlay={
        <Tooltip id={order.orderId}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr 
        key={order.id}
        className="order-book-order"
        onClick={(e) => fillOrder(dispatch, exchange, order, account)}
      >
        <td className={`text-${order.orderTypeClass}`}>{order.formattedTimestamp}</td>
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
        <td>{order.etherAmount}</td>
      </tr>
    </OverlayTrigger>
  )
}

const showOrderBook = (props) => {
  const { orderBook } = props
  return (
    <tbody>
      {renderHeader()}
      {orderBook.sellOrders.map((order) => renderOrder(order,props))}
      {renderHeader()}
      {orderBook.buyOrders.map((order) => renderOrder(order,props))}
    </tbody>
  )
}

class OrderBook extends Component {
  render() {
    //console.log("orderBook loaded? from the OrderBook component: ",this.props.orderBookLoaded)
    //console.log("Order book (Open Orders) - ", this.props.orderBook)

    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small">
              { this.props.displayOrderBook ? showOrderBook(this.props) : <Spinner type='table' /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)

  //console.log("displayOrderBook: ", orderBookLoaded && !orderFilling)

  return {
    displayOrderBook: orderBookLoaded && !orderFilling,
    orderBook: orderBookSelector(state),
    exchange: exchangeSelector(state), 
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook)
