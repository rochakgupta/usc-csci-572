package stats;

import com.opencsv.CSVWriter;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Discovered extends Stat {
    private static Discovered instance = null;

    private List<Item> items;

    private Discovered() {

    }

    synchronized public static Discovered getInstance() {
        if (instance == null) {
            Discovered discovered = new Discovered();
            discovered.items = new ArrayList<>();
            instance = discovered;
        }
        return instance;
    }

    synchronized public static void add(String url, boolean fetching) {
        Discovered.getInstance().items.add(Item.of(url, fetching));
    }

    public static void write(String filepath) throws IOException {
        CSVWriter csvWriter = getCSVWriter(filepath);
        for (Item item : Discovered.getInstance().items) {
            csvWriter.writeNext(new String[]{
                    cleanURL(item.url),
                    item.fetching ? "OK" : "N_OK"
            });
        }
        csvWriter.close();
    }

    private static class Item {
        String url;

        boolean fetching;

        public static Item of(String url, boolean fetching) {
            Item item = new Item();
            item.url = url;
            item.fetching = fetching;
            return item;
        }
    }
}
