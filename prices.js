var http = require('http');
var https = require('https');
var querystring = require('querystring');
var q = require('promised-io/promise');

// probably a better way to do this with promises...
var origCallback,
    deferred;

var data = {
  twoWayTrip : true,
  fareType : 'DOLLARS',
  adultPassengerCount : 1,
  seniorPassengerCount : 0,
  submitButton : true
};

var headers = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Origin': 'https://www.southwest.com',
  'Referer': 'https://www.southwest.com/',
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36'
};

var options = {
  host: 'www.southwest.com',
  path: '/flight/search-flight.html',
  method: 'POST',
  headers: headers
};

function firstReqCallback(res) {
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    //console.log(chunk);
  });
  res.on('end', function() {
    var cookieString = '';
    res.headers['set-cookie'].forEach(function(cookie) {
      cookieString += cookie.split(';')[0] + '; ';
    });
    secondReqCallback(res.headers, cookieString);
  });
}

function secondReqCallback(headers, cookies) {
  https.get({
    host: options.host,
    path: headers.location,
    headers: {
      'Cookie': cookies
    }
  }, function(res) {
    var bodyHtml = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      bodyHtml += chunk;
    });
    res.on('end', function() {
      var regex = /[Out|In]\d+C\".*\$(\d\d\d)/g,
          matchesArray = [],
          matches;
      while ((matches = regex.exec(bodyHtml)) != null) {
        matchesArray.push(matches[1]);
      }
      deferred.resolve(matchesArray);
    });
  });
}

var Prices = {
  setData: function(config) {
    // origin
    if (config.origin) {
      data.originAirport = config.origin;
    } else {
      throw new Error('You need an origin');
    }

    // destination
    if (config.destination) {
      data.destinationAirport = config.destination;
    } else {
      throw new Error('You need a destination');
    }

    // outbound date
    if (config.outboundDate) {
      data.outboundDateString = config.outboundDate;
    } else {
      throw new Error('You need an outbound date');
    }

    // return date
    if (config.returnDate) {
      data.returnDateString = config.returnDate;
    } else {
      throw new Error('You need a return date');
    }
  },
  getPrices: function() {
    deferred = q.defer();

    if (!data.originAirport || !data.destinationAirport || !data.outboundDateString || !data.returnDateString) {
      throw new Error('Data hasn\'t been set!');
    }

    var stringifiedData = querystring.stringify(data);

    headers['Content-Length'] = stringifiedData.length;

    var req = https.request(options, firstReqCallback);

    req.on('error', function(err) {
      deferred.reject('there was an error! ', err);
    });

    req.write(stringifiedData);
    req.end();

    return deferred.promise;
  }
};

module.exports = Prices;