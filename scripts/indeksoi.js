/* jshint node:true */

'use strict';

var walk = require('walk');
var _ = require('underscore');
var files = [];
var fs = require('fs');

var walker = walk.walk('./fin01', { followLinks: false });

// formaatti:
// {
//     "languages": {
//         "jpn": [
//             {
//                 "id": "013013",
//                 "title": "kun toimeen tartuttiin"
//             },
//             {
//                 "id": "12312",
//                 "title": "Lodi dodi"
//             }
//         ]
//     },
//     "countries": {
//         "fin": [
//             {
//                 "id": "02141",
//                 "title": "Jopas jotakin"
//             }
//         ]
//     }
// }

var index = {"languages": {}, "countries": {} };

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
  var file = files.pop();
  fs.readFile(file, 'utf-8', function(err, data) {
    getContent(files);
    var fileContents = data.split('\n');
    indexContent(fileContents);
    console.log(JSON.stringify(index));
  });
}

function indexContent(content) {
  var currentRecord = new Record('');
  //currentRecord = new Record('');
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
  if (!index.languages[record.language]) {
    index.languages[record.language] = [];
  }
  if (!index.countries[record.country]) {
    index.countries[record.country] = [];
  }
  var minimizedRecord = {"id": record.id, "title": record.title};
  index.languages[record.language].push(minimizedRecord);
  index.countries[record.country].push(minimizedRecord);
}

function recordLanguage(line) {
  return line.slice(53, 56);
}

function recordTitle(line) {
  return line.slice(18);
}

function recordCountry(line) {
  var countryCode = line.slice(33, 36);
  if (countryCode.slice(-1) === '^') {
    countryCode = countryCode.slice(0,2);
  }
  return countryCode;
}