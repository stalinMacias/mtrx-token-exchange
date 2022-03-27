import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';
// Web3 will allows us to interact with the Smart Contracts
import Web3 from 'web3';

import Navbar from './Navbar'
import Content from './Content'


import {
  loadProvider,
  getAccount,
  loadToken,
  loadExchange
} from '../store/interactions'


import { contractsLoaded } from '../store/selectors'


class App extends Component {
  componentWillMount(){
    this.loadBlockchainData(this.props.dispatch);   // Send the dispatch object that is loaded by redux in the props when redux is connected
  } // componentWillMount

  async loadBlockchainData(dispatch) {
    const provider = await loadProvider(dispatch);
    //console.log("provider: ", provider);

    if (provider === window.ethereum) {
      // Validating Metamask is installed
      console.log('Ethereum successfully detected!');
      const ethereum = window.ethereum;

      // Interactions that will be handled by the provider reducer //

      //const networkId = await getNetworkId(provider,dispatch);
      //console.log("The networkId is" , networkId) //Network:  0x38 reffers to the BSC

      const networkVersion = await ethereum.request({ method: 'net_version' })
      //console.log("Network Version: ", networkVersion)

      // Ask the user to connect an account
      await ethereum.request({method: 'eth_requestAccounts'});

      const account = await getAccount(provider,dispatch);
      //console.log(account);
      if (account.length === 0) {
        // MetaMask is locked or the user has not connected any account
        window.alert('Please connect to MetaMask.');
      }

      // Interactions that will be handled by the web3 reducer //

      // Instantiate a new web3 connection to be able to interact with the Contracts
      const web3 = new Web3(window.ethereum);

      // Load the token smart contract
      const token = await loadToken(web3,networkVersion,dispatch)
      if(!token) {
        window.alert("Token Smart Contract not detected on the current network. Please select another network within MetaMask!")
      }

      //const totalSupply = await token.methods.totalSupply().call();
      //console.log("Token's total supply: ", totalSupply);


      // Interactions that will be handled by the exchange reducer //
      // Load the exchange smart contract
      const exchange = await loadExchange(web3,networkVersion,dispatch);
      //console.log('Exchange Smart Contract: ', exchange);
      if(!exchange) {
        window.alert("Exchange Smart Contract not detected on the current network. Please select another network within MetaMask!")
      }

      //const userTokensBalance = await exchange.methods.balanceOf(token._address,account).call();
      //console.log("User's token balance: ",userTokensBalance)    

    } else if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    } else {
      // if the provider is not detected, detectEthereumProvider resolves to null
      console.error('Please install MetaMask!');
    }


  } // loadBlockchainData

  render() {
    //console.log("Contracts loaded? ",this.props.contractsLoaded)
    return (
      <div>
        <Navbar />
        { (this.props.contractsLoaded) ? <Content /> : <div className="content"><h1>No hay contrato carnal</h1></div> }
      </div>
    );
  }
}

function mapStateToProps(state) {
    return {
      contractsLoaded: contractsLoaded(state)
    }
}

export default connect(mapStateToProps)(App);
