import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'

import {
  myFilledOrdersLoadedSelector,
  myFilledOrdersSelector,
  myOpenOrdersLoadedSelector,
  myOpenOrdersSelector,
  myWithdrawsLoadedSelector,
  myTokenWithdrawsSelector,
  myEtherWithdrawsSelector,
  exchangeSelector,
  accountSelector,
  orderCancellingSelector,
  myDepositsLoadedSelector,
  myTokenDepositsSelector,
  myEtherDepositsSelector
} from '../store/selectors'

import {
  cancelOrder
} from '../store/interactions'

const showMyFilledOrders = (myFilledOrders) => {
  return(
    <tbody>
      { myFilledOrders.map((order) => {
        return(
          <tr key={order.orderId}>
            <td className="text-muted">{order.formattedTimestamp}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

const showMyOpenOrders = (props) => {
  //console.log("Props received in the showMyOpenOrders: " , props)
  const { myOpenOrders, exchange, account, dispatch } = props
  return(
    <tbody>
      { myOpenOrders.map((order) => {
        return(

          <tr key={order.orderId}>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            <td
              className="text-muted cancel-order"
              onClick={(e) => {
                cancelOrder(dispatch, exchange, order, account)
              }}
            >
              X
            </td>
          </tr>
        )
      }) }
    </tbody>
  )
}

const showMyDeposits = (myDeposits) => {
  //console.log("My Deposits: ", myDeposits)
  return(
    <tbody>
      {myDeposits.map((deposit) => {
        return(
          <tr key={deposit.depositId}>
            <td className={`text-${deposit.depositTypeClass}`}>{deposit.amount}</td>
            <td className={`text-${deposit.depositTypeClass}`}>{deposit.formattedTimestamp}</td>
          </tr>
        )
      }) }
    </tbody>
  )
}

const showWithdraws = (myWithdraws) => {
  return(
    <tbody>
      { myWithdraws.map((withdraw) => {
        return(
          <tr key={withdraw.withdrawId}>
            <td className={`text-${withdraw.withdrawTypeClass}`}>{withdraw.amount}</td>
            <td className={`text-${withdraw.withdrawTypeClass}`}>{withdraw.formattedTimestamp}</td>
          </tr>
        )
      }) }
    </tbody>
  )
}


class MyTransactions extends Component {

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Transactions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="trades" className="bg-dark text-white">

            <Tab eventKey="trades" title="Trades Completed" className="bg-dark">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>MTRX</th>
                    <th>MTRX/ETH</th>
                  </tr>
                </thead>
                {this.props.myFilledOrdersLoadedSelector ? showMyFilledOrders(this.props.myFilledOrdersSelector) : <Spinner  type='table' />}
              </table>
            </Tab>

            <Tab eventKey="orders" title="Open Orders">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>MTRX Amount</th>
                    <th>MTRX/ETH</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                {this.props.myOpenOrdersLoaded ? showMyOpenOrders(this.props) : <Spinner  type='table' />}
              </table>
            </Tab>

            <Tab eventKey="deposits" title="Deposits">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>MTRX Amount</th>
                    <th>Deposit Date</th>
                  </tr>
                </thead>
                {this.props.myDepositsLoaded ? showMyDeposits(this.props.myTokenDeposits) : <Spinner  type='table' />}
              </table>

              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>ETH Amount</th>
                    <th>Deposit Date</th>
                  </tr>
                </thead>
                {this.props.myDepositsLoaded ? showMyDeposits(this.props.myEtherDeposits) : <Spinner  type='table' />}
              </table>



            </Tab>

            <Tab eventKey="withdraws" title="Withdraws">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>MTRX Amount</th>
                    <th>Withdraw Date</th>
                  </tr>
                </thead>
                {this.props.myWithdrawsLoadedSelector ? showWithdraws(this.props.myTokenWithdraws) : <Spinner  type='table' />}
              </table>


              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>ETH Amount</th>
                    <th>Withdraw Date</th>
                  </tr>
                </thead>
                {this.props.myWithdrawsLoadedSelector ? showWithdraws(this.props.myEtherWithdraws) : <Spinner  type='table' />}
              </table>
              

            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  //console.log("myFilledOrdersLoaded? ", this.props.myFilledOrdersLoadedSelector)
  //console.log("myFilledOrdersSelector ", this.props.myFilledOrdersSelector)
  //console.log("myOpenOrdersLoaded? ", myOpenOrdersLoadedSelector(state))
  //console.log("myOpenOrdersSelector: " , myOpenOrdersSelector(state))
  //console.log("myWithdrawsLoadedSelector?: " ,myWithdrawsLoadedSelector(state))
  //console.log("myTokenWithdraw: " , myTokenWithdraw(state))
  //console.log("myTokenDeposits: " , myTokenDepositsSelector(state))


  const myOpenOrdersLoaded = myOpenOrdersLoadedSelector(state)
  const orderCancelling = orderCancellingSelector(state)

  return {
    myFilledOrdersLoadedSelector : myFilledOrdersLoadedSelector(state),
    myFilledOrdersSelector : myFilledOrdersSelector(state),
    myOpenOrdersLoaded : myOpenOrdersLoaded && !orderCancelling,
    myOpenOrders : myOpenOrdersSelector(state),
    myWithdrawsLoadedSelector : myWithdrawsLoadedSelector(state),
    myTokenWithdraws : myTokenWithdrawsSelector(state),
    myEtherWithdraws: myEtherWithdrawsSelector(state),
    myDepositsLoaded: myDepositsLoadedSelector(state),
    //myDepositsLoaded: true,
    myTokenDeposits: myTokenDepositsSelector(state),
    myEtherDeposits: myEtherDepositsSelector(state),
    exchange: exchangeSelector(state),
    account : accountSelector(state)
    
  }
}

export default connect(mapStateToProps)(MyTransactions);
