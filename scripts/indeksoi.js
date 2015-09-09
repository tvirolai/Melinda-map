/* jshint node:true */

// Ohjelma lukee Aleph Sequential -muotoiset tiedostot (N = 73000) yksi kerrallaan
// ja syöttää niiden bib-id:t ja otsikot kielittäin ja maittain MongoDB-kantaan

'use strict';

var walk = require('walk');
var _ = require('underscore');
var files = [];
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/indeksi';
var writeCount = 0;

var walker = walk.walk('./fin01', { followLinks: false });

// formaatti:
// {"id": 948729234, "country": "fi", "language": "fin", "title": "Kun toimeen tartuttiin"}
// 

var index = [];

walker.on('file', function(root, stat, next) {
  root = root.slice(1);
  files.push(__dirname + root + '/' + stat.name);
  next();
});

walker.on('end', function() {
  files = filterList(files);
  getContent(files);
});

var Record = function newRecord(id) {
    this.id = id,
    this.language = '',
    this.country = '',
    this.title = '',
    this.supplement = 0
  }

function filterList(files) {
  return _.filter(files, function(filename) { if (filename.slice(-4) === '.seq') return filename; });
}

function getContent(files) {
  index = [];
  var file = files.pop();
  fs.readFile(file, 'utf-8', function(err, data) {
    var fileContents = data.split('\n');
    indexContent(fileContents);
    saveToDB(index);
  });
}

function indexContent(content) {
  var currentRecord = new Record('');
  for (var i = 0; i < content.length; i++) {
    var line = content[i];
    var lineID = line.slice(0, 9);
    var field = line.slice(10, 13);
    if (currentRecord.id !== lineID) {
      if (currentRecord.id.length > 1) {
        indexRecord(currentRecord);
      }
      currentRecord = new Record(lineID);
      currentRecord.id = lineID;
    }
    if (field === '008') {
      currentRecord.language = recordLanguage(line);
      currentRecord.country = recordCountry(line);
    }
    if (field === '245') {
      currentRecord.title = recordTitle(line);
    }
    if (field === '773') {
      currentRecord.supplement = 1;
    }
  }
}

function indexRecord(record) {
  if (record.supplement === 0) {
    delete record.supplement;
    index.push(record);
  }
}

function recordLanguage(line) {
  return line.slice(53, 56);
}

function recordTitle(line) {
  return line.slice(18).replace(/\$\$[A-Za-z]/g, ' ').trim();
}

function recordCountry(line) {
  var countryCode = line.slice(33, 36);
  if (countryCode.slice(-1) === '^') {
    countryCode = countryCode.slice(0,2);
  }
  return countryCode;
}

function saveToDB(index) {
  // database: indeksi, collection: data
  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) throw err;
    else {
      //console.log("Successfully connected to " + mongoUrl + ".");
      db.collection('data').insert(index, function(err, doc) {
        writeCount += index.length;
        console.log("Successfully inserted: " + writeCount);
        db.close();
        getContent(files);
      });
    }
  });
}