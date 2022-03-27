import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import Chart from 'react-apexcharts'
//import { chartOptions, dummyData } from './PriceChart.config.js'
import { chartOptions } from './PriceChart.config.js'

import { 
  priceChartLoadedSelector,
  priceChartSelector
} from '../store/selectors'

const priceSymbol = (lastPriceChange) => {
  let output
  if (lastPriceChange === '+') {
    output = <span className="text-success">&#9650;</span>
  }else {
    output = <span className="text-danger">&#9660;</span>
  }
  return (output)
}

const showPriceChart = (priceChart) => {
  return (
    <div className="price-chart">
      <div className="price">
        <h4>MTRX/ETH &nbsp; {priceChart.lastPrice} &nbsp; {priceSymbol(priceChart.lastPriceChange)} </h4>
      </div>
      <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%' />
    </div>
  )
}

class PriceChart extends Component {


  render() {
    //console.log("priceChartLoaded",this.props.priceChartLoaded)
    console.log("priceChart: ",this.props.priceChart)
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Price Chart
        </div>
        <div className="card-body">
          {this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    priceChartLoaded : priceChartLoadedSelector(state),
    priceChart : priceChartSelector(state)
  }
}

export default connect(mapStateToProps)(PriceChart);
