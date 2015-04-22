/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wifi.detect;

/**
 *
 * @author NelsonGomes
 */
public class Location {

    private static final int invalid = -1000;
    private double lattitude;
    private double longitude;

    public Location(double lat, double lon) {
        lattitude = lat;
        longitude = lon;
    }

    public double getLattitude() {
        return lattitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getCoordinates() {
        String lat = "" + Math.abs(lattitude);
        if (lattitude < 0) {
            lat += " W";
        } else {
            lat += "E";
        }
        String lon = "" + Math.abs(longitude);
        if (longitude < 0) {
            lon += " S";
        } else {
            lon += " N";
        }
        String result = lat + " " + lon;

        return result;
    }

    public boolean isValidLocation() {
        if (longitude == invalid && lattitude == invalid) {
            return false;
        }
        return true;
    }
}
