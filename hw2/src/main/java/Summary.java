import org.apache.commons.httpclient.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Summary {

    private static final Logger logger = LoggerFactory.getLogger(Summary.class);

    private static final Integer KB = 1024;

    public static void write() throws IOException {
        String filepath = Config.SUMMARY_FILE_PATH;

        FileUtil.createFile(filepath);
        FileWriter fileWriter = new FileWriter(filepath);

        writeHeader(fileWriter);
        writeEmptyLine(fileWriter);

        writeStatisticsHeader(fileWriter, "Fetch Statistics");
        writeFetchStatistics(fileWriter);
        writeEmptyLine(fileWriter);

        writeStatisticsHeader(fileWriter, "Outgoing URLs");
        writeUrlStatistics(fileWriter);
        writeEmptyLine(fileWriter);

        writeStatisticsHeader(fileWriter, "Status Codes");
        writeStatusCodeStatistics(fileWriter);
        writeEmptyLine(fileWriter);

        writeStatisticsHeader(fileWriter, "File Sizes");
        writePageSizeStatistics(fileWriter);
        writeEmptyLine(fileWriter);

        writeStatisticsHeader(fileWriter, "Content Types");
        writeContentTypeStatistics(fileWriter);

        fileWriter.close();
    }

    private static void writeHeader(FileWriter fileWriter) throws IOException {
        writeStatistic(fileWriter, "Name", Config.NAME);
        writeStatistic(fileWriter, "USC ID", Config.USC_ID);
        writeStatistic(fileWriter, "News site crawled", String.format("%s.com", Config.NEWS_WEBSITE_DOMAIN));
        writeStatistic(fileWriter, "Number of threads", Config.NUMBER_OF_CRAWLERS);
    }

    private static void writeFetchStatistics(FileWriter fileWriter) throws IOException {
        List<Fetching.Item> items = Fetching.getItems();
        long attemptedFetches = items.size();
        long successfulFetches = getNumberOfSuccessfulFetches(items);
        long failedOrAbortedFetches = attemptedFetches - successfulFetches;

        writeStatistic(fileWriter, "# fetches attempted", attemptedFetches);
        writeStatistic(fileWriter, "# fetches succeeded", successfulFetches);
        writeStatistic(fileWriter, "# fetches failed or aborted", failedOrAbortedFetches);
    }

    private static void writeUrlStatistics(FileWriter fileWriter) throws IOException {
        List<Discovered.Item> items = Discovered.getItems();
        Integer urls = items.size();
        long uniqueUrls = getNumberOfUniqueUrls(items);
        long withinWebsiteUrls = getNumberOfWithinWebsiteUniqueUrls(items);
        long outsideWebsiteUrls = getNumberOfOutsideWebsiteUniqueUrls(items);

        writeStatistic(fileWriter, "Total URLs extracted", urls);
        writeStatistic(fileWriter, "# unique URLs extracted", uniqueUrls);
        writeStatistic(fileWriter, "# unique URLs within News Site", withinWebsiteUrls);
        writeStatistic(fileWriter, "# unique URLs outside News Site", outsideWebsiteUrls);
    }

    private static void writeStatusCodeStatistics(FileWriter fileWriter) throws IOException {
        List<Fetching.Item> items = Fetching.getItems();
        Map<Integer, Long> statusCodes = getCountsOfStatusCodes(items);
        for (Integer statusCode : statusCodes.keySet().stream().sorted().collect(Collectors.toList())) {
            String statusCodeDescription = String.format("%s %s", statusCode, HttpStatus.getStatusText(statusCode));
            writeStatistic(fileWriter, statusCodeDescription, statusCodes.get(statusCode));
        }
    }

    private static void writePageSizeStatistics(FileWriter fileWriter) throws IOException {
        List<Visited.Item> items = Visited.getItems();
        writeStatistic(fileWriter, "< 1KB", getNumberOfPagesOfSize(items, 0, KB));
        writeStatistic(fileWriter, "1KB ~ <10KB", getNumberOfPagesOfSize(items, KB, 10 * KB));
        writeStatistic(fileWriter, "10KB ~ <100KB", getNumberOfPagesOfSize(items, 10 * KB, 100 * KB));
        writeStatistic(fileWriter, "100KB ~ <1MB", getNumberOfPagesOfSize(items, 100 * KB, 1000 * KB));
        writeStatistic(fileWriter, ">= 1MB", getNumberOfPagesOfSize(items, 1000 * KB, Integer.MAX_VALUE));
    }

    private static void writeContentTypeStatistics(FileWriter fileWriter) throws IOException {
        List<Visited.Item> items = Visited.getItems();
        Map<String, Long> contentTypes = getCountsOfContentTypes(items);
        for (Map.Entry<String, Long> entry : contentTypes.entrySet()) {
            writeStatistic(fileWriter, entry.getKey(), entry.getValue());
        }
    }

    private static void writeStatisticsHeader(FileWriter fileWriter, String header) throws IOException {
        fileWriter.write(String.format("%s:\n", header));
        StringBuilder separator = new StringBuilder();
        for (int i = 0; i < header.length() + 1; i++) {
            separator.append("=");
        }
        fileWriter.write(String.format("%s\n", separator.toString()));
    }

    private static void writeEmptyLine(FileWriter fileWriter) throws IOException {
        fileWriter.write("\n");
    }

    private static void writeStatistic(FileWriter fileWriter, String statistic, Object value) throws IOException {
        fileWriter.write(String.format("%s: %s\n", statistic, value.toString()));
    }

    private static long getNumberOfSuccessfulFetches(List<Fetching.Item> items) {
        return items.stream().filter(item -> item.statusCode == 200).count();
    }

    private static long getNumberOfUniqueUrls(List<Discovered.Item> items) {
        return items.stream().map(Discovered.Item::getUrl).distinct().count();
    }

    private static long getNumberOfWithinWebsiteUniqueUrls(List<Discovered.Item> items) {
        return items.stream().filter(Discovered.Item::isWithinWebsite).map(Discovered.Item::getUrl).distinct().count();
    }

    private static long getNumberOfOutsideWebsiteUniqueUrls(List<Discovered.Item> items) {
        return items.stream().filter(item -> !item.isWithinWebsite()).map(Discovered.Item::getUrl).distinct().count();
    }

    private static Map<Integer, Long> getCountsOfStatusCodes(List<Fetching.Item> items) {
        return items.stream().collect(Collectors.groupingBy(Fetching.Item::getStatusCode, Collectors.counting()));
    }

    private static long getNumberOfPagesOfSize(List<Visited.Item> items, Integer min, Integer max) {
        return items.stream().map(Visited.Item::getSize).filter(size -> size >= min && size < max).count();
    }

    private static Map<String, Long> getCountsOfContentTypes(List<Visited.Item> items) {
        return items.stream().collect(Collectors.groupingBy(Visited.Item::getContentType, Collectors.counting()));
    }
}
