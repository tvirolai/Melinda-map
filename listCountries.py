#!/usr/bin/env python
# -*- coding: utf-8 -*

import os
import argparse
import time
import datetime
import operator


class Lister(object):
  def __init__(self):
    self.directory = "./fin01/"
    self.seqfiles = []

    for dirnames, subdirlist, filenames in os.walk(self.directory, topdown=False):
      for filename in filenames:
        self.seqfiles.append(os.path.join(dirnames, filename))
    
    self.seqfiles = sorted([x for x in self.seqfiles if x[-4:] == '.seq'])

  def julkaisumaat(self):

    countries = {}
    numberOfSeqfiles = len(self.seqfiles)
    readFileCount = 0
    totalSkippedRecords = 0
    totalNumberOfRecords = 0
    for seqfile in self.seqfiles:
      with open(seqfile, 'rt') as f:
        content = f.read().split('\n')
        content, skippedRecordCount, recordCount = self.weedSupplements(content)
        totalNumberOfRecords += recordCount
        if skippedRecordCount > 0:
          totalSkippedRecords += skippedRecordCount
        for row in content:
          if row[10:13] == '008':
            fieldContents = row[18:]
            countryCode = fieldContents[15:18]
            if (countryCode[2] == '^'):
              countryCode = countryCode[:2]
            countries = self.countCountries(countryCode, countries)
        readFileCount += 1
        if readFileCount % 1000 == 0:
          print("Read {0} / {1} files.".format(readFileCount, numberOfSeqfiles))
    sortedCountries = self.printDictSortedByValue(countries)
    for country in sortedCountries:
      print(country[0], country[1])
    self.writeToFile(sortedCountries)

    print("Skipped {0} / {1} records".format(totalSkippedRecords, totalNumberOfRecords))

  def weedSupplements(self, content):
    # Funktio ottaa argumenttina tiedoston (100 tietuetta) sisällön listaksi pilkottuna
    # Palauttaa 008-kentät niistä tietueista, jotka eivät ole osakohteita
    # eli joissa ei ole kenttää 773 (linkki emoon)
    currentRecordID = ""
    skippedRecordCount = 0
    totalRecordCount = 0
    weededContents = []
    lastIndex = len(content) - 1
    currentRecord = {"recordID": 0,
    "008": "",
    "773": 0}
    for i, line in enumerate(content):
      recordID = line[:9]
      if (currentRecord["recordID"] != recordID):
        currentRecord["recordID"] = recordID
      if (recordID != currentRecordID or i == lastIndex):
        if (currentRecord["773"] == 0):
          weededContents.append(currentRecord["008"])
        currentRecordID = recordID
        totalRecordCount += 1
        currentRecord = {"recordID": 0,
        "008": "",
        "773": 0}
      field = line[10:13]
      if (field == "008" and currentRecord["recordID"] == recordID):
        currentRecord["008"] = line
      if (field == "773"):
        currentRecord["773"] = 1
        skippedRecordCount += 1
        print(currentRecord)
    return weededContents, skippedRecordCount, totalRecordCount

  def writeToFile(self, sortedCountries):
    with open('countryCodes.csv', 'wt') as f:
      for country in sortedCountries:
        asString = "{0},{1}\n".format(country[0], country[1])
        f.write(asString)

  def countCountries(self, code, countries):
    code = code.lower()
    if not code in countries:
      countries[code] = 1
    else:
      countries[code] += 1
    return countries

  def printDictSortedByValue(self, variable):
    sortedDict = sorted(variable.items(), key=operator.itemgetter(1), reverse=True)
    return sortedDict

if __name__ == '__main__':
  parser = argparse.ArgumentParser(description="Aleph Seq dump processor")
  parser.add_argument("-j", "--julkaisumaat", help="Hae listaus julkaisumaista", action='store_true')
  args = parser.parse_args()
  lister = Lister()
  if args.julkaisumaat:
    lister.julkaisumaat()