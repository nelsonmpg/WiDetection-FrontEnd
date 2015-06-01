#!/bin/bash

# inicia o monitor da rede wireless
airodump-ng mon0 -w outA --output-format netxml &

# Para o script
sleep 2

# Inicia o loop infinito
while true;
   do
        # Procura pelo ultimo ficheiro netxml do output
        filename=`ls | grep .csv | tail -1`

        # Inicia o contador das linhas do ficheiro xml
        ((i=0))

        # Inicia o loop de leitura de linha a linha do ficheiro xml
        while IFS= read -r line
           do
                # Envia para o endereco especificado a linha em questao
                echo "$i -> $line" >/dev/udp/192.168.1.93/80

                # Incrementa o contador das linhas do xml
                ((i++))
        done < "$filename"

        # Para o script para que chegue todo ao destina para que seja depois ordenado
        sleep 2

        # Envia a informacao de que chegou ao fim o envio do ficheiro xml
        echo "$i -> fim" >/dev/udp/192.168.1.93/80
done
