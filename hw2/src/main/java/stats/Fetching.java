package stats;

import com.opencsv.CSVWriter;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Fetching extends Stat {

    private static Fetching instance = null;

    private List<Item> items;

    private Fetching() {

    }

    synchronized public static Fetching getInstance() {
        if (instance == null) {
            Fetching fetching = new Fetching();
            fetching.items = new ArrayList<>();
            instance = fetching;
        }
        return instance;
    }

    synchronized public static void add(String url, int statusCode) {
        Fetching.getInstance().items.add(Item.of(url, statusCode));
    }

    public static void write(String filepath) throws IOException {
        CSVWriter csvWriter = getCSVWriter(filepath);
        csvWriter.writeNext(new String[]{"URL", "Status"});
        for (Item item : Fetching.getInstance().items) {
            csvWriter.writeNext(new String[]{item.url, String.valueOf(item.statusCode)});
        }
        csvWriter.close();
    }

    private static class Item {
        String url;

        int statusCode;

        private Item() {

        }

        public static Item of(String url, int statusCode) {
            Item item = new Item();
            item.url = url;
            item.statusCode = statusCode;
            return item;
        }
    }
}
