/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wifi.detect;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

/**
 *
 * @author NelsonGomes
 */
public class DataFiles {

    /**
     * Returns an ArrayList of the contents of the file
     *
     * @param filePath The file path of the file you want to read
     * @return The contents of the given file in ArrayList form
     */
    public static ArrayList<String> getFile(String filePath) {
        ArrayList<String> fileContents = new ArrayList<String>();

        try {
            FileInputStream fis = new FileInputStream(filePath);
            BufferedReader br = new BufferedReader(new InputStreamReader(fis));

            String str;

            while ((str = br.readLine()) != null) {
                fileContents.add(str);
            }

            fis.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return fileContents;
    }
}
