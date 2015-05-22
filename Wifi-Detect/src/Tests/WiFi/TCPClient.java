/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Tests.WiFi;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

/**
 *
 * @author NelsonGomes
 */
class TCPClient {

    public static void main(String[] args) throws IOException {

        Socket socket = null;
        PrintWriter out = null;
        BufferedReader in = null;

        try {
            socket = new Socket("192.168.10.103", 80);
            out = new PrintWriter(socket.getOutputStream(), true);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        } catch (UnknownHostException e) {
            System.err.println("Don't know about host");
            System.exit(1);
        } catch (IOException e) {
            System.err.println("Couldn't get I/O for the connection");
            System.exit(1);
        }

        BufferedReader read = new BufferedReader(new InputStreamReader(System.in));
        String num1, num2;

		//System.out.println(in.readLine()); //Uncomment to debug
        System.out.print("This int-->");
        num1 = read.readLine();
        out.println(num1);
        System.out.print("Times this int-->");
        num2 = read.readLine();
        out.println(num2);
        System.out.println("Equals");

        System.out.println(in.readLine());

        out.close();
        in.close();
        read.close();
        socket.close();
    }
}
