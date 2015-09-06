/* jshint node:true */

'use strict';

var fs = require('fs');

function parseCountries(callback) {
  // Generate a sorted array of objects like [{'countryCode': 'fin', 'amount': 1230912, 'name': 'Suomi', 'percentage': '29.9'}]
  var totalCount = 0;
  fs.readFile('./data/countryCodes_verified.csv', function(err, data) {
    if (err) throw err;
    var arrayOfCountries = [];
    var array = data.toString().split('\n');
    array.forEach(function(d) {
      var country = d.split(',');
      var amount = Number(country[1]);
      var countryObject = {'countryCode': country[0], 'amount': amount};
      if (amount >= 0) {
        totalCount += Number(country[1]);
      }
      //console.log(totalCount);
      arrayOfCountries.push(countryObject);
    });
    // Read country names and percentages from another file
    var codeToName = {};
    fs.readFile('./data/maakoodiTaulukko_korjattu.csv', function(err, data) {
      if (err) throw err;
      var anotherArray = data.toString().split('\n');
      anotherArray.forEach(function(d) {
        var element = d.toString().split(',');
        var countryCode = element[0];
        var countryName = element[1];
        codeToName[countryCode] = countryName;
      });
      arrayOfCountries.forEach(function(d) {
        var name = codeToName[d.countryCode];
        d.name = name;
        d.percentage = percentage(d.amount, totalCount);
      });
      callback(arrayOfCountries);
    });
  });
}

function percentage(amount, total) {
  return amount / total * 100;
}

function writeCountriesToCSV() {
  console.log("m");
}

parseCountries(function(data) {
  var tsvData = "";
  data.forEach(function(d) {
    if (d.countryCode.length > 1) {
      tsvData += d.countryCode + "\t";
      tsvData += d.amount + "\t";
      tsvData += d.name + "\t";
      tsvData += d.percentage + "\n";      
    }
  });
  fs.writeFile('countriesAsTSV.tsv', tsvData, function(err) {
    if (!err) {
      console.log("Done!");
    }
  })
});