/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wifi.detect;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.HashMap;

/**
 *
 * @author NelsonGomes
 */
public class UDPReceive {
    //HashMap<InetAddress, Integer> cache = new HashMap<InetAddress, Integer>();
    
  /**
   * HashMap para guardar percentagem de sinal
   * key: ipaddress/mac address/ ou outra coisa
   *  -> hashmap key = numero da contagem
   *                   -> percentagem do sinal 
   */
    HashMap<InetAddress, HashMap<Integer, String>> cache = new HashMap<InetAddress,   HashMap<Integer,String>>();
    public static void main(String args[]) {
        try {
            //para teste adicionar sempre localhost
            InetAddress localByIp = InetAddress.getByName("127.0.0.1");
            int port = 2244;

            // Create a socket to listen on the port.
            DatagramSocket dsocket = new DatagramSocket(port);

      // Create a buffer to read datagrams into. If a
            // packet is larger than this buffer, the
            // excess will simply be discarded!
            byte[] buffer = new byte[2048];

            // Create a packet to receive data into the buffer
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

            // Now loop forever, waiting to receive packets and printing them.
            while (true) {
                // Wait to receive a datagram
                dsocket.receive(packet);

                // Convert the contents to a string, and display them
                String msg = new String(buffer, 0, packet.getLength());
                System.out.println(packet.getAddress().getHostName() + ": "
                        + msg);
                
               //guardar em função do inetaddress
                //cache.get(localByIp).put(, msg)

                // Reset the length of the packet before reusing it.
                packet.setLength(buffer.length);
            }
        } catch (Exception e) {
            System.err.println(e);
        }
    }

}
