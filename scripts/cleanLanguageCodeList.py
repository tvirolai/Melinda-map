#!/usr/bin/env python
# -*- coding: utf-8 -*

# Tämä ohjelma parsii MARC21-formaatin mukaiset kielikoodit koneluettavaan muotoon
# yhdistelemällä vanhentuneet koodit sallittuun muotoon

import csv
import operator

fixedCountryCodes = {'virheellinen': 0}
checkingTable = {'virheellinen': 'virheellinen koodi'}
discardedCodes = {}
totalCount = 0

with open('kieliKoodit.csv', 'rt') as f:
    lyhenteet = list(csv.reader(f))

with open('languageCodes.csv', 'rt') as f:
    kielikoodiRaportti = list(csv.reader(f))

for code in lyhenteet:
    checkingTable[code[0]] = code[1]

for line in kielikoodiRaportti:
    totalCount += int(line[1])
    if not (line[0]) in checkingTable:
        fixedCountryCodes['virheellinen'] += int(line[1])
        discardedCodes[line[0]] = line[1]
    else:
        if line[0] in fixedCountryCodes:
            fixedCountryCodes[line[0]] += int(line[1])
        else:
            fixedCountryCodes[line[0]] = int(line[1])


def printDictSortedByValue(variable):
    sortedDict = sorted(
        variable.items(), key=operator.itemgetter(1), reverse=True)
    return sortedDict


def percentage(number):
    return round(float(number) / totalCount * 100, 1)

fixedCountryCodes = printDictSortedByValue(fixedCountryCodes)
for i, line in enumerate(fixedCountryCodes):
    print("{0}. {1}: {2}".format(
        i + 1, checkingTable[line[0]], line[1]), end="")
    osuus = percentage(line[1])
    if (osuus >= 0.1):
        print(" ({0} %)".format(osuus))
    else:
        print("")
