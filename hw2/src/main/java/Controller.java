import edu.uci.ics.crawler4j.crawler.CrawlConfig;
import edu.uci.ics.crawler4j.crawler.CrawlController;
import edu.uci.ics.crawler4j.fetcher.PageFetcher;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtConfig;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import stats.Discovered;
import stats.Fetching;
import stats.Visited;

public class Controller {

    private static final Logger logger = LoggerFactory.getLogger(Controller.class);

    private static final String ROOT_STORAGE_FOLDER = "src/test/resources/";

    private static final String CRAWL_STORAGE_FOLDER = getCrawlStorageFolder();

    private static final String DISCOVERED_FILE_PATH = getStatFilepath("urls");

    private static final String FETCHING_FILE_PATH = getStatFilepath("fetch");

    private static final String VISITED_FILE_PATH = getStatFilepath("visit");

    private static final int NUMBER_OF_CRAWLERS = 7;

    private static final int MAX_DEPTH_OF_CRAWLING = 16;

    private static final int MAX_PAGES_TO_FETCH = 20;

    public static void main(String[] args) throws Exception {
        CrawlConfig config = new CrawlConfig();
        config.setCrawlStorageFolder(CRAWL_STORAGE_FOLDER);
        config.setMaxDepthOfCrawling(MAX_DEPTH_OF_CRAWLING);
        config.setMaxPagesToFetch(MAX_PAGES_TO_FETCH);

        PageFetcher pageFetcher = new PageFetcher(config);
        RobotstxtConfig robotstxtConfig = new RobotstxtConfig();
        RobotstxtServer robotstxtServer = new RobotstxtServer(robotstxtConfig, pageFetcher);
        CrawlController controller = new CrawlController(config, pageFetcher, robotstxtServer);

        controller.addSeed("https://www.usatoday.com/");

        controller.start(Crawler.class, NUMBER_OF_CRAWLERS);

        Discovered.write(DISCOVERED_FILE_PATH);
        Fetching.write(FETCHING_FILE_PATH);
        Visited.write(VISITED_FILE_PATH);
    }

    private static String getCrawlStorageFolder() {
        return String.format("%s/crawler4j", ROOT_STORAGE_FOLDER);
    }

    private static String getStatFilepath(String filenamePrefix) {
        return String.format("%s/%s_%s.csv", ROOT_STORAGE_FOLDER, filenamePrefix, "usatoday");
    }
}
