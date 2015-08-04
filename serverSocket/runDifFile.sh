#!/bin/bash

grep -Fxvf copyFile.csv `ls | grep scanNetworks*.csv | tail -1` > fileDiff.csv
cp  `ls | grep scanNetworks*.csv | tail -1` copyFile.csv
