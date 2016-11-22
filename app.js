var notifier = require('node-notifier');
var path = require('path');
var fs = require('fs');
var Prices = require('./prices');

var deals = [],
    priceArray = [],
    checkFreq = 1800000;

function convertToMilliseconds(minutes) {
  return minutes * 60000;
}

function readJSON(data, callback) {
  console.log('File read');
  data = JSON.parse(data);

  if (data.constructor !== Array) {
    console.log('Hmm... data read wasn\'t an array');
    return;
  }

  callback(data);
}

function checkForJSON(callback) {

  fs.readFile(path.join(__dirname, '/data/prices.json'), 'utf-8', function(err, data) {
    if (err) {
      fs.writeFile(path.join(__dirname, '/data/prices.json'), '[]', function() {
        readJSON('[]', callback);
      });
    } else {
      readJSON(data, callback)
    }
  });
}

function saveJSON(obj) {
  var jsonObj = JSON.stringify(obj);
  fs.writeFile(path.join(__dirname, '/data/prices.json'), jsonObj, function(err) {
    if (err) {
      console.log('Uh oh, there was an error saving: ', err);
    } else {
      console.log('File saved');
    }
  });
}

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
      console.log('New data retrieved!')

      // save the matches
      saveJSON(matches);

      // process the results
      newDeals = processPrices(matches);

      if (newDeals.length > 0) {
        newDeals.forEach(function(aNewDeal) {
          newDeal(aNewDeal);
        });
      }

      // reset the timer
      timer(checkFreq);
    });
  }, delay);
}

function init() {

  // set things up
  Prices.setData({
    origin: 'BWI',
    destination: 'OAK',
    outboundDate: '11/28/2016',
    returnDate: '11/29/2016'
  });

  // set the delay (pass in minutes)
  checkFreq = convertToMilliseconds(30);

  // get prices from last time
  checkForJSON(function(data) {
    priceArray = data;
    // start the timer!
    timer();
  });
}

init();
