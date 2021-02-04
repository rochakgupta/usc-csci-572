import com.opencsv.CSVWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Fetching {

    private static Fetching instance = null;

    private List<Item> items;

    private Fetching() {

    }

    synchronized private static Fetching getInstance() {
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

    synchronized public static List<Item> getItems() {
        return Fetching.getInstance().items;
    }

    public static void write() throws IOException {
        CSVWriter csvWriter = FileUtil.getCSVWriter(Config.FETCHING_FILE_PATH);
        csvWriter.writeNext(new String[]{"URL", "Status"});
        for (Item item : Fetching.getInstance().items) {
            csvWriter.writeNext(new String[]{
                    FileUtil.cleanUrl(item.getUrl()),
                    String.valueOf(item.statusCode)
            });
        }
        csvWriter.close();
    }

    static class Item {
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

        public String getUrl() {
            return url;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }
}
