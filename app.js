var notifier = require('node-notifier');
var path = require('path');
var Prices = require('./prices');

var deals = [],
    priceArray = [
      '300',
      '301',
      '375',
      '375',
      '209',
      '199',
      '329',
      '221',
      '221',
      '216',
      '217',
      '301',
      '371',
      '241',
      '293',
      '301',
      '301',
      '301'
    ];

function getNewPrices() {
  return Prices.getPrices();
}

function checkForDiffs(orgPrice, newPrice) {
  return newPrice - orgPrice;
}

function newDeal(dealsObj) {
  var title,
      msg;
  //console.log('A new deal!', dealsObj);

  // is it a deal?
  if (dealsObj.difference > 0) {
    title = 'Uh oh...';
    msg = 'The price on one of the flights just jumped from $' + dealsObj.origPrice + ' to $' + dealsObj.newPrice;
  } else {
    title = 'A new deal!',
    msg = 'There\'s a new deal from Southwest. The $' + dealsObj.origPrice + ' price just went down to $' + dealsObj.newPrice;
  }
  notifier.notify({
    title: title,
    message: msg,
    icon: path.join(__dirname, 'southwest-airlines-heart.png')
  });
}

function processPrices(matches) {
  var newDeals = [];

  // look for any deals by comparing the existing array
  matches.forEach(function(price, i) {
    if (checkForDiffs(priceArray[i], price) !== 0) {
      newDeals.push({
        origPrice : priceArray[i],
        newPrice: price,
        difference: checkForDiffs(priceArray[i], price)
      });
    }
  });

  // set the price array with these matches
  priceArray = matches;
  return newDeals;
}

function timer(delay) {
  var newDeals;

  // set delay to zero if it isn't set
  if (!delay) {
    delay = 0;
  }

  // get new prices
  setTimeout(function() {
    getNewPrices().then(function(matches) {
      // when promise is resolved...

      // show matches in console
      //console.log('New data retrieved: ', matches);

      // process the results
      newDeals = processPrices(matches);

      if (newDeals.length > 0) {
        newDeals.forEach(function(aNewDeal) {
          newDeal(aNewDeal);
        });
      }

      // reset the timer
      timer(5000);
    });
  }, delay);
}

function init() {

  // set things up
  Prices.setData({
    origin: 'BWI',
    destination: 'OAK',
    outboundDate: '05/16/2015',
    returnDate: '05/23/2015'
  });

  // start the timer!
  timer();
}

init();