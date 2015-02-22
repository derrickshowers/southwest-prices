var Prices = require('./prices');

Prices.setData({
  origin: 'BWI',
  destination: 'OAK',
  outboundDate: '05/16/2015',
  returnDate: '05/23/2015'
})

Prices.getPrices().then(function(matches) {
  console.log(matches);
});