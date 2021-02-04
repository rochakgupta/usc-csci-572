import com.opencsv.CSVWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Discovered {
    private static Discovered instance = null;

    private List<Item> items;

    private Discovered() {

    }

    synchronized private static Discovered getInstance() {
        if (instance == null) {
            Discovered discovered = new Discovered();
            discovered.items = new ArrayList<>();
            instance = discovered;
        }
        return instance;
    }

    synchronized public static void add(String url, boolean fetching, boolean withinWebsite) {
        Discovered.getInstance().items.add(Item.of(url, fetching, withinWebsite));
    }

    synchronized public static Item find(String url) {
        return Discovered.getInstance().items.parallelStream().filter(item -> item.url.equals(url)).findFirst().orElse(
                null);
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
