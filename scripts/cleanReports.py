#!/usr/bin/env python
# -*- coding: utf-8 -*

# Tämä ohjelma siivoaa maakoodilistan siten, että
# 1. Koodit validoidaan formaatin listasta
# 2. Vanhentuneiden tai muuten ei-käytettävien koodien lukemat yhdistetään kohdekoodiin
#		 (esim. USAn osavaltiot --> USA eli xxk)
# 3. Tunnistamattomien koodien lukemat yhdistetään kohtaan xx (tuntematon)
# 4. Epästandardit lasketaan

# Dict-muuttujassa tarkistusTaulu on kaikki MARC21-kielikoodit muodossa:
# voimassaolevakoodi: 0
# vanhentunutkoodi: voimassaolevakoodi

import csv
import operator

cleaned_countryCodes = {'xx': 0}
discarded_countryCodes = {}


def normalize(code):
	return code.strip('[').strip(']')

with open('maakoodiTaulukko_korjattu.csv', 'rt') as f:
	maakoodiTaulukko = list(csv.reader(f))
	tarkistusTaulu = {}
	for i, row in enumerate(maakoodiTaulukko):
		if i == 0:
			next
		if len(row) == 5:
			tarkistusTaulu[normalize(row[0])] = row[4]
		else:
			tarkistusTaulu[row[0]] = 0

with open('countryCodes.csv', 'rt') as f:
	countryCodes = dict(csv.reader(f))

def iterateCountries():
	merged_countryCodes = 0
	for country in countryCodes:
		# Jos maakoodia ei löydy virallisten koodien listalta, niiden summat lisätään kohtaan "tuntematon koodi"
		if not country in tarkistusTaulu:
			cleaned_countryCodes['xx'] += int(countryCodes[country])
			discarded_countryCodes[country] = int(countryCodes[country])
		else:
			# Jos löytyy "käytä"-muoto, koodin summa lisätään virallisen muodon summaan
			if tarkistusTaulu[country] != 0:
				merged_countryCodes += int(countryCodes[country])
				if not tarkistusTaulu[country] in cleaned_countryCodes:
					cleaned_countryCodes[tarkistusTaulu[country]] = int(countryCodes[country])
				else:
					cleaned_countryCodes[tarkistusTaulu[country]] += int(countryCodes[country])
			# Jos koodi on virallinen, se lisätään sellaisenaan
			elif tarkistusTaulu[country] == 0:
				if not country in cleaned_countryCodes:
					cleaned_countryCodes[country] = int(countryCodes[country])
				else:
					cleaned_countryCodes[country] += int(countryCodes[country])
	print("Merged countrycodes: {0}.".format(merged_countryCodes))

def writeToFile():
	with open('countryCodes_verified.csv', 'wt') as f:
		f.write(stringify(cleaned_countryCodes))
	with open('discarded_countryCodes.csv', 'wt') as f:
		f.write(stringify(discarded_countryCodes))

def stringify(variable):
	# Function accepts a dict, sorts it by value and returns as string
	variable = printDictSortedByValue(variable)
	variableAsString = ""
	for line in variable:
		variableAsString += "{0},{1}\n".format(line[0], line[1])
	return variableAsString

def printDictSortedByValue(variable):
  sortedDict = sorted(variable.items(), key=operator.itemgetter(1), reverse=True)
  return sortedDict

iterateCountries()
writeToFile()
#print(cleaned_countryCodes)
sumOfDiscardedCodes = sum(discarded_countryCodes.values())
print("Discarded countrycodes: {0}".format(sumOfDiscardedCodes))

#print(tarkistusTaulu)