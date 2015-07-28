#!/bin/bash

ps auxf |grep 'air' |`awk '{ print "kill " $2 }'`

echo "Stop All Process!!!"
