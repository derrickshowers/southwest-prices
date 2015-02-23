var Prices = require('./prices');

function getNewPrices() {
  return Prices.getPrices();
}

function processPrices(matches) {
  console.log(matches);
}

function timer(delay) {
  setTimeout(function() {
    getNewPrices().then(function(matches) {
      // when promise is resolved...

      // process the results
      processPrices(matches);

      // reset the timer
      timer(5000);
    });
  }, delay)
}

function init() {

  // set things up
  Prices.setData({
    origin: 'BWI',
    destination: 'OAK',
    outboundDate: '05/16/2015',
    returnDate: '05/23/2015'
  });

  // start the timer (no initial delay)
  timer(0);
}

init();