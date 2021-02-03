package stats;

import com.opencsv.CSVWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Visited extends Stat {

    private static Visited instance = null;

    private List<Visited.Item> items;

    private Visited() {

    }

    synchronized public static Visited getInstance() {
        if (instance == null) {
            Visited visited = new Visited();
            visited.items = new ArrayList<>();
            instance = visited;
        }
        return instance;
    }

    static synchronized public void add(String url, int size, int numberOfOutlinks, String contentType) {
        Visited.getInstance().items.add(Item.of(url, size, numberOfOutlinks, contentType));
    }

    public static void write(String filepath) throws IOException {
        CSVWriter csvWriter = getCSVWriter(filepath);
        csvWriter.writeNext(new String[]{"URL", "Size (Bytes)", "# of Outlinks", "Content Type"});
        for (Item item : Visited.getInstance().items) {
            csvWriter.writeNext(new String[]{
                    cleanURL(item.url),
                    String.valueOf(item.size),
                    String.valueOf(item.numberOfOutlinks),
                    item.contentType
            });
        }
        csvWriter.close();
    }

    private static class Item {
        String url;

        int size;

        int numberOfOutlinks;

        String contentType;

        private Item() {

        }

        public static Item of(String url, int size, int numberOfOutlinks, String contentType) {
            Item visited = new Item();
            visited.url = url;
            visited.size = size;
            visited.numberOfOutlinks = numberOfOutlinks;
            visited.contentType = contentType;
            return visited;
        }
    }
}
