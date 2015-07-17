#!/usr/bin/env python
# -*- coding: utf-8 -*

# Tämä ohjelma parsii MARC21-formaatin mukaiset kielikoodit koneluettavaan muotoon
# yhdistelemällä vanhentuneet koodit sallittuun muotoon

import csv
import operator

with open('maakoodiTaulukko.csv', 'rt') as f:
	lista = list(csv.reader(f))

uusiLista = []

for i, rivi in enumerate(lista):
	if i == 0:
		rivi.append("Käytä")
	if "Käytä:" in rivi[3]:
		koodi = rivi[3]
		firstIndex = koodi.index(": ") + 2
		lastIndex = firstIndex + 3
		koodi = koodi[firstIndex:lastIndex].strip()
		if "." in koodi:
			koodi = koodi[:2]
		rivi.append(koodi)
	uusiLista.append(rivi)

with open('maakoodiTaulukko_korjattu.csv', 'wt') as f:
	wr = csv.writer(f)
	for line in uusiLista:
		wr.writerow(line)