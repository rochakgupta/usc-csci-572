public class Config {
    public static final String NAME = "Rochak Gupta";

    public static final String USC_ID = "9683467768";

    public static final String WEBSITE_DOMAIN = "usatoday";

    public static final int NUMBER_OF_CRAWLERS = 7;

    public static final int MAX_DEPTH_OF_CRAWLING = 16;

    public static final int MAX_PAGES_TO_FETCH = 20000;

    public static final String ROOT_STORAGE_FOLDER_PATH = "src/test/resources/";

    public static final String CRAWL_STORAGE_FOLDER_PATH = getCrawlStorageFolderPath();

    public static final String SEED_URL = getSeedUrl();

    public static final String WEBSITE_HOSTNAME = getWebsiteHostname();

    public static final String DISCOVERED_FILE_PATH = getStatFilepath("urls");

    public static final String FETCHING_FILE_PATH = getStatFilepath("fetch");

    public static final String VISITED_FILE_PATH = getStatFilepath("visit");

    public static final String SUMMARY_FILE_PATH = getSummaryFilepath();

    private static String getCrawlStorageFolderPath() {
        return String.format("%s/crawler4j", ROOT_STORAGE_FOLDER_PATH);
    }

    private static String getSeedUrl() {
        return String.format("https://www.%s.com", WEBSITE_DOMAIN);
    }

    private static String getWebsiteHostname() {
        return String.format("www.%s.com", WEBSITE_DOMAIN);
    }

    private static String getStatFilepath(String filenamePrefix) {
        return String.format("%s/%s_%s.csv", ROOT_STORAGE_FOLDER_PATH, filenamePrefix, WEBSITE_DOMAIN);
    }

    private static String getSummaryFilepath() {
        return String.format("%s/CrawlReport_%s.txt", ROOT_STORAGE_FOLDER_PATH, WEBSITE_DOMAIN);
    }
}
