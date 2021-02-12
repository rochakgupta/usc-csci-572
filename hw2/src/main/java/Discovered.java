import com.opencsv.CSVWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Discovered {
    private static Discovered instance = null;

    private List<Item> items;

    private Map<String, Item> itemsMap;

    private Discovered() {

    }

    synchronized private static Discovered getInstance() {
        if (instance == null) {
            Discovered discovered = new Discovered();
            discovered.items = new ArrayList<>();
            discovered.itemsMap = new HashMap<>();
            instance = discovered;
        }
        return instance;
    }

    synchronized public static void add(String url, boolean fetching, boolean withinWebsite) {
        Item item = Item.of(url, fetching, withinWebsite);
        Discovered discovered = Discovered.getInstance();
        discovered.items.add(item);
        discovered.itemsMap.putIfAbsent(url, item);
    }

    synchronized public static Item find(String url) {
        return Discovered.getInstance().itemsMap.get(url);
    }

    synchronized public static List<Item> getItems() {
        return Discovered.getInstance().items;
    }

    public static void write() throws IOException {
        CSVWriter csvWriter = FileUtil.getCSVWriter(Config.DISCOVERED_FILE_PATH);
        for (Item item : Discovered.getInstance().items) {
            csvWriter.writeNext(new String[]{
                    FileUtil.cleanUrl(item.getUrl()),
                    item.isFetching() ? "OK" : "N_OK"
            });
        }
        csvWriter.close();
    }

    public static class Item {
        private String url;

        private boolean fetching;

        private boolean withinWebsite;

        public static Item of(String url, boolean fetching, boolean withinWebsite) {
            Item item = new Item();
            item.url = url;
            item.fetching = fetching;
            item.withinWebsite = withinWebsite;
            return item;
        }

        public String getUrl() {
            return url;
        }

        public boolean isFetching() {
            return fetching;
        }

        public boolean isWithinWebsite() {
            return withinWebsite;
        }
    }
}
