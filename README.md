# Southwest Price Tracker

Nothing super exciting, but serves as a way to quickly see 'Wanna Get Away' prices for Southwest Airlines. Eventually the goal is to do some sort of notification when prices change, but for now just serves as an API to get the prices as an array.

## How's it Work?

First, require the 'prices' modules: `require('./prices')`  

Then, use the following methods:

1. `setData`  
Pass an object that contains the following properties: origin, destination, outboundDate, returnDate. Origin and destination need formatted as the 3-letter airport code, and dates MM/DD/YYYY.

2. `getPrices`  
Just call it! A promise will be returned. When resolved, an array of prices is passed.

## Installation

1. Clone the repo
2. `npm install`