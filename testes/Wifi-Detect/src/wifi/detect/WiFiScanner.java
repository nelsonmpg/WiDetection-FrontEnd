/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wifi.detect;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

/**
 *
 * @author NelsonGomes
 */
public class WiFiScanner {

    public static ArrayList<String> scan() {
        ArrayList<String> output = new ArrayList<String>();

        Process process = null;

        try {
            process = Runtime.getRuntime().exec("netsh wlan show networks mode=bssid");
        } catch (IOException e) {
            e.printStackTrace();
        }

        InputStream out = process.getInputStream();
        BufferedReader br = new BufferedReader(new InputStreamReader(out));
        String line;

        try {
            while ((line = br.readLine()) != null) {
                output.add(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return output;
    }

    public static ArrayList<AccessPoint> parseAccessPoint(ArrayList<String> ap) {
        ArrayList<AccessPoint> output = new ArrayList<>();
        ArrayList<String> bssid = new ArrayList<>();
        ArrayList<String> signalString = new ArrayList<>();
        ArrayList<Integer> signalInt = new ArrayList<>();

        ap.stream().filter((str) -> (!str.contains("BSSID") && !str.contains("Signal"))).forEach((str) -> {
            ap.remove(str);
        });

        ap.stream().forEach((str) -> {
            if (str.contains("BSSID")) {
                bssid.add(str.substring(str.indexOf(":") + 2));
            } else if (str.contains("Signal")) {
                signalString.add(str.substring(str.indexOf(":") + 2));
            }
        });

        for (String str : signalString) {
            str = str.substring(0, str.indexOf("%"));
            signalInt.add(Integer.parseInt(str));
        }

        for (int i = 0; i < bssid.size(); i++) {
            output.add(new AccessPoint(bssid.get(i), signalInt.get(i), (javax.xml.stream.Location) new Location(-1000, -1000)));
        }

        return output;
    }
    public static void main(String[] args) {
        
        ArrayList<String> list = WiFiScanner.scan();

        list.stream().forEach((String list1) -> {
//              System.out.println(list1);
//            
//            String[] a = list1.split("\n");
                //System.out.println(a1);
                if (list1.contains("BSSID")) {
                    list1 = list1.substring(list1.indexOf(":")+2);
                    System.out.println(list1);
                }
                if (list1.contains("Signal")) {
                    list1 = list1.substring(list1.indexOf(":")+2);
                    System.out.println(list1);
                }
        });       
    }

}
