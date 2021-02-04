import com.opencsv.CSVWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Visited {

    private static Visited instance = null;

    private List<Visited.Item> items;

    private Visited() {

    }

    synchronized private static Visited getInstance() {
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

    static synchronized public List<Item> getItems() {
        return Visited.getInstance().items;
    }

    public static void write() throws IOException {
        CSVWriter csvWriter = FileUtil.getCSVWriter(Config.VISITED_FILE_PATH);
        csvWriter.writeNext(new String[]{"URL", "Size (Bytes)", "# of Outlinks", "Content Type"});
        for (Item item : Visited.getInstance().items) {
            csvWriter.writeNext(new String[]{
                    FileUtil.cleanUrl(item.getUrl()),
                    String.valueOf(item.getSize()),
                    String.valueOf(item.getNumberOfOutlinks()),
                    item.getContentType()
            });
        }
        csvWriter.close();
    }

    static class Item {
        private String url;

        private int size;

        private int numberOfOutlinks;

        private String contentType;

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

        public String getUrl() {
            return url;
        }

        public int getSize() {
            return size;
        }

        public int getNumberOfOutlinks() {
            return numberOfOutlinks;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
