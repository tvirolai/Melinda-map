/* jshint node:true */

'use strict';

var fs = require('fs');

function countPercentage(amount, total) {
  return amount / total * 100;
}

function parseLanguages(callback) {
  var totalNumberOfLanguages = 0;
  var languageCodes = {};
  var codeCounts = [];
  var unKnownCodes = 0;
  var allData = [];
  fs.readFile('./data/kielikoodit_korjattu.csv', function(err, data) {
    if (err) throw err;
    var array = data.toString().split('\n');
    array.forEach(function(d) {
      var line = d.split(',');
      var code = line[0];
      var country = line[1];
      if (code.length <= 3 && code.length > 0) {
        languageCodes[code] = country;
      }
    });
    //console.log(languageCodes);
    fs.readFile('./data/languageCodes.csv', function(err, data) {
      if (err) throw err;
      var array = data.toString().split('\n');
      array.forEach(function(d) {
        var line = d.split(',');
        var code = line[0];
        var count = line[1];
        if (Number(count) >= 0) {
          var item = [];
          item.push(code, Number(count));
          codeCounts.push(item);
          totalNumberOfLanguages += Number(count);
        }
      });
      // console.log(codeCounts);
      codeCounts.forEach(function(d) {
        var item = [];
        var languageCode = d[0];
        var codeCount = d[1];
        var percentage = countPercentage(codeCount, totalNumberOfLanguages);
        if (languageCode in languageCodes) {
          var languageName = languageCodes[languageCode];
          item.push(languageCode, codeCount, languageName, percentage);
          allData.push(item);
        } else {
          unKnownCodes += codeCount;
        }
      });
      var unKnownData = [];
      var unKnownPercentage = countPercentage(unKnownCodes, totalNumberOfLanguages);
      unKnownData.push('???', unKnownCodes, 'tunnistamaton tai virheellinen koodi', unKnownPercentage);
      allData.push(unKnownData);
      callback(allData);
    });
  });
}

function writeToTSV(data) {
  var asString = '';
  data.forEach(function(d) {
    asString += d[0] + '\t';
    asString += d[1] + '\t';
    asString += d[2] + '\t';
    asString += d[3] + '\n';
  });
  fs.writeFile('./data/languagesAsTSV.tsv', asString, function(err) {
    if (err) throw err;
    else {
      console.log('Done!');
    }
  });
}

parseLanguages(writeToTSV);