import edu.uci.ics.crawler4j.crawler.CrawlConfig;
import edu.uci.ics.crawler4j.crawler.CrawlController;
import edu.uci.ics.crawler4j.fetcher.PageFetcher;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtConfig;
import edu.uci.ics.crawler4j.robotstxt.RobotstxtServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Controller {

    private static final Logger logger = LoggerFactory.getLogger(Controller.class);

    public static void main(String[] args) throws Exception {
        CrawlConfig config = new CrawlConfig();
        config.setCrawlStorageFolder(Config.CRAWL_STORAGE_FOLDER_PATH);
        config.setMaxDepthOfCrawling(Config.MAX_DEPTH_OF_CRAWLING);
        config.setMaxPagesToFetch(Config.MAX_PAGES_TO_FETCH);

        PageFetcher pageFetcher = new PageFetcher(config);
        RobotstxtConfig robotstxtConfig = new RobotstxtConfig();
        RobotstxtServer robotstxtServer = new RobotstxtServer(robotstxtConfig, pageFetcher);
        CrawlController controller = new CrawlController(config, pageFetcher, robotstxtServer);

        controller.addSeed(Config.SEED_URL);

        controller.start(Crawler.class, Config.NUMBER_OF_CRAWLERS);

        Discovered.write();
        Fetching.write();
        Visited.write();
        Summary.write();
    }
}
