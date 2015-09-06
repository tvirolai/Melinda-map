#!/usr/bin/env python
# -*- coding: utf-8 -*

# Tämä ohjelma parsii datan sekalaisista tiedostoista JSON-muotoon visualisointia varten
# Tuotetaan kaksi tiedostoa, countries.json ja languages.json
# Muoto: {"fin": {"amount": 1230912, "name": "Suomi", "percentage":
# "29.9"}} (countries.json)

import json
import csv


def countriesToJSON():
    countriesDict = {}
    codeToCountryName = {}
    totalCount = 0
    with open('./data/countryCodes_verified.csv', 'rt') as f:
        # Formaatti: [['fi', '2148857'], ...]
        luvut = list(csv.reader(f))
    with open('./data/maakoodiTaulukko_korjattu.csv', 'rt') as f:
        # Formaatti: [ ['aa', 'Albania', 'Albania', '\xa0'], ...]
        koodit = list(csv.reader(f))
    for line in koodit:
        codeToCountryName[line[0]] = line[1]
    for line in luvut:
        totalCount += int(line[1])
    for line in luvut:
        countryCode = line[0]
        countryCount = int(line[1])
        countryPercentage = percentage(countryCount, totalCount)
        countryName = "unknown"
        try:
            countryName = codeToCountryName[countryCode]
        except:
            print(countryCode)

        countriesDict[countryCode] = {"amount": countryCount,
                                      "name": countryName,
                                      "percentage": countryPercentage}
    writeDictToJSON(countriesDict, 'test.json')


def writeDictToJSON(dictionary, filename):
    with open(filename, 'w') as outputfile:
        json.dump(dictionary, outputfile)

def percentage(number, totalCount):
    return round(float(number) / totalCount * 100, 1)

countriesToJSON()
