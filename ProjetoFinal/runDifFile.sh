#!/bin/bash

grep -Fxvf copyFile.csv `ls | grep .csv | tail -1` > fileDiff.csv
