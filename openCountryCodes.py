#!/usr/bin/env python
# -*- coding: utf-8 -*

import csv

with open('countryCodes_verified.csv', 'rt') as f:
    luvut = list(csv.reader(f))

with open('maakoodiTaulukko_korjattu.csv', 'rt') as f:
    koodit = list(csv.reader(f))

koodiDict = {}
openedCodes = []
totalCount = 0

def percentage(number):
    return round(float(number) / totalCount * 100, 1)

for line in koodit:
    koodiDict[line[0]] = line[1]

for line in luvut:
    try:
        countryName = koodiDict[line[0]]
        country = (countryName, line[1])
        openedCodes.append(country)
        totalCount += int(line[1])
    except:
        next

for i, line in enumerate(openedCodes):
    if (i == 0):
        print("JULKAISUJEN MÄÄRÄT MAITTAIN MELINDASSA\n")
    print("{0}. {1}: {2}".format(i + 1, line[0], line[1]), end="")
    if (percentage(line[1])) >= 0.2:
        print(" ({0} %)".format(percentage(line[1])))
    else:
        print("")
