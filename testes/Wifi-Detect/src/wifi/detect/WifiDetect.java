/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wifi.detect;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author NG&RD TESTES
 */
public class WifiDetect {

    public static void main(String[] args) throws UnknownHostException {
        try {
            // Get by host name
            InetAddress ipt = InetAddress.getByName("ipt.pt");
            // Get by IP as host name
            InetAddress byIpAsName = InetAddress.getByName("8.8.8.8");
            // Get by IP as highest-order byte array
            InetAddress byIp = InetAddress.getByAddress(new byte[]{64, 69, 35, (byte) 190});
            // Get Local address
            InetAddress local = InetAddress.getLocalHost();
            // Get Local Address by Loopback IP
            InetAddress localByIp = InetAddress.getByName("127.0.0.1");

            printAddressInfo("By-Name (IPT)", ipt);
            printAddressInfo("By-Name (Using IP as Host)", byIpAsName);
            printAddressInfo("By-IP: (64.69.35.190)", byIp);
            printAddressInfo("Special Local Host", local);
            printAddressInfo("Local Host By IP", localByIp);
        } catch (Exception ex) {
            Logger.getLogger(WifiDetect.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private static void printAddressInfo(String name, InetAddress... hosts) throws Exception {
        System.out.println("===== Printing Info for: '" + name + "' =====");
        for (InetAddress host : hosts) {
            System.out.println("Host Name: " + host.getHostName());
            System.out.println("Canonical Host Name: " + host.getCanonicalHostName());
            System.out.println("Host Address: " + host.getHostAddress());
            System.out.println("Calculated Host Address: " + getIpAsString(host));
            System.out.print("Is Any Local: " + host.isAnyLocalAddress());
            System.out.print(" - Is Link Local: " + host.isLinkLocalAddress());
            System.out.print(" - Is Loopback: " + host.isLoopbackAddress());
            System.out.print(" - Is Multicast: " + host.isMulticastAddress());
            System.out.println(" - Is Site Local: " + host.isSiteLocalAddress());
            System.out.println("Is Reachable in 2 seconds: " + host.isReachable(2000));
        }
    }

    private static String getIpAsString(InetAddress address) {
        byte[] ipAddress = address.getAddress();
        StringBuffer str = new StringBuffer();
        for (int i = 0; i < ipAddress.length; i++) {
            if (i > 0) {
                str.append('.');
            }
            str.append(ipAddress[i] & 0xFF);
        }
        return str.toString();
    }
}
