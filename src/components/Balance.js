import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'

// Web3 will allows us to interact with the Smart Contracts
import Web3 from 'web3';

import {
  loadBalances,
  depositEther,
  depositToken,
  withdrawEther,
  withdrawToken
} from '../store/interactions'

import {
  exchangeSelector,
  tokenSelector,
  accountSelector,
  // Balances
  etherBalanceSelector,
  etherBalanceExchangeSelector,
  tokenBalanceSelector,
  tokenBalanceExchangeSelector,
  balancesLoadingSelector,
  // Deposits
  etherDepositAmountChangeSelector,
  tokenDepositAmountChangeSelector,
  // Withdraws
  etherWithdrawAmountChangeSelector,
  tokenWithdrawAmountChangeSelector

} from '../store/selectors'

import {
  etherDepositAmountChange,
  tokenDepositAmountChange,

  // Withdraws
  etherWithdrawAmountChange,
  tokenWithdrawAmountChange
} from '../store/actions'


const showForm = (props) => {

  // Instantiate a new web3 connection to be able to interact with the Contracts
  const web3 = new Web3(window.ethereum);

  const {
    dispatch,
    exchange,
    account,
    token,
    // Balances
    etherBalance,
    etherBalanceExchange,
    tokenBalance,
    tokenBalanceExchange,
    // Deposits
    etherDepositAmount,
    tokenDepositAmount,

    // Withdraws
    etherWithdrawAmount,
    tokenWithdrawAmount
  } = props

  return (
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">

      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{etherBalanceExchange}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          depositEther(dispatch, exchange, web3, etherDepositAmount, account)
          //this.forceUpdate()
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input type="text" placeholder="ETH Amount" onChange={(e) => dispatch(etherDepositAmountChange(e.target.value))}
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit ETHERs</button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MTRX</td>
              <td>{tokenBalance}</td>
              <td>{tokenBalanceExchange}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input type="text" placeholder="MTRX Amount"
              onChange={(e) => dispatch(tokenDepositAmountChange(e.target.value))}
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit Tokens</button>
          </div>
        </form>

      </Tab>

      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{etherBalanceExchange}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(e) => dispatch(etherWithdrawAmountChange(e.target.value))}
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw ETHERs</button>
          </div>
        </form>


        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MTRX</td>
              <td>{tokenBalance}</td>
              <td>{tokenBalanceExchange}</td>
            </tr>
          </tbody>
        </table>

        <form className="row" onSubmit={(event) => {
          event.preventDefault()
          withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
        }}>
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="MTRX Amount"
              onChange={(e) => dispatch(tokenWithdrawAmountChange(e.target.value))}
              className="form-control form-control-sm bg-dark text-white"
              required />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw Tokens</button>
          </div>
        </form>



      </Tab>

    </Tabs>
  )
}

class Balance extends Component {
  componentWillMount() {
    this.interactWithBlockchain()
  }

  async interactWithBlockchain() {
    // Instantiate a new web3 connection to be able to interact with the Contracts
    const web3 = new Web3(window.ethereum);

    const { dispatch, exchange, token, account } = this.props
    await loadBalances(dispatch, web3, exchange, token, account)

  }


  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Balances
        </div>
        <div className="card-body">
          {
            /* Before the component is mounted, the interactWithBlockchain() function calls the loadBalances() interaction, this means that the balancesLoading flag will be set to false
               Only when the balances needs to be refreshed, the balancesLoading parameter will be set to true, and at that moment, the Spinner component will be renderd.
                - Scenarios when the balancesLoading could be set to true:
                  * When depositing ethers or tokens
                  * When withdrawing ethers or tokens
                  * 
              - If balancesLoading is set to true ---> Show the Spinner component; It means that the balances are been updated
              - If balancesLoading is set to false --> Show the content's of the showForm() function; It means that the balances have been loaded
            */
          }
          {this.props.showForm ? <Spinner /> : showForm(this.props)}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const balancesLoading = balancesLoadingSelector(state)
  //console.log("Balances loading: ?", balancesLoading)
  return {
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),

    // Balances
    etherBalance: etherBalanceSelector(state),
    etherBalanceExchange: etherBalanceExchangeSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    tokenBalanceExchange: tokenBalanceExchangeSelector(state),
    showForm: balancesLoading,

    // Deposits
    etherDepositAmount: etherDepositAmountChangeSelector(state),
    tokenDepositAmount: tokenDepositAmountChangeSelector(state),

    // Withdraws
    etherWithdrawAmount: etherWithdrawAmountChangeSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountChangeSelector(state)

  }
}

export default connect(mapStateToProps)(Balance)
