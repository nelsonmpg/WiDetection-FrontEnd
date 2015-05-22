#!/bin/bash
filename=`ls | grep .netxml | head -1 | tail -1`
((i=0))
a=""
((j=4))
echo "-- Inicio --" >/dev/udp/192.168.1.93/80
while IFS= read -r line
do
        if (($i > $j)); 
            then
                echo $a >/dev/udp/192.168.1.93/80
                a=""
                ((i=0))
        fi
        a+=$line
        ((i++))
done < "$filename"
echo $a >/dev/udp/192.168.1.93/80
echo "-- Fim --" >/dev/udp/192.168.1.93/80