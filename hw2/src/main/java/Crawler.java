import edu.uci.ics.crawler4j.crawler.Page;
import edu.uci.ics.crawler4j.crawler.WebCrawler;
import edu.uci.ics.crawler4j.url.WebURL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Pattern;

public class Crawler extends WebCrawler {

    private static final Logger logger = LoggerFactory.getLogger(Crawler.class);

    private static final Pattern DOC_PATTERNS = Pattern.compile(".*(\\.(html?|php|pdf|docx?))$");

    private static final Pattern IMAGE_PATTERNS = Pattern.compile(".*(\\.(jpe?g|ico|png|bmp|svg|gif|webp|tiff))$");

    @Override
    public boolean shouldVisit(Page page, WebURL url) {
        String urlString = url.getURL();
        Discovered.Item item = Discovered.find(urlString);
        if (item == null) {
            boolean withinWebsite = hasRequiredHostname(url);
            boolean fetching = withinWebsite && (!hasExtension(url) || hasRequiredExtension(url));
            Discovered.add(urlString, fetching, withinWebsite);
            return fetching;
        } else {
            Discovered.add(urlString, item.isFetching(), item.isWithinWebsite());
            return false;
        }
    }

    private boolean hasRequiredHostname(WebURL url) {
        String domain = url.getDomain();
        String subdomain = url.getSubDomain();
        if (subdomain.isEmpty()) {
            subdomain = "www";
        }
        String hostname = String.format("%s.%s", subdomain, domain);
        return hostname.equals(Config.WEBSITE_HOSTNAME);
    }

    private boolean hasExtension(WebURL url) {
        String path = url.getPath();
        String filename = path.substring(path.lastIndexOf("/") + 1);
        return filename.contains(".");
    }

    private boolean hasRequiredExtension(WebURL url) {
        String path = url.getPath().toLowerCase();
        return DOC_PATTERNS.matcher(path).matches() || IMAGE_PATTERNS.matcher(path).matches();
    }

    @Override
    protected void handlePageStatusCode(WebURL webUrl, int statusCode, String statusDescription) {
        String url = webUrl.getURL();
        Fetching.add(url, statusCode);
    }

    @Override
    public void visit(Page page) {
        String url = page.getWebURL().getURL();
        String contentType = getContentType(page);
        if (hasRequiredContentType(contentType)) {
            int size = getPageSize(page);
            int numberOfOutlinks = getNumberOfOutlinks(page);
            Visited.add(url, size, numberOfOutlinks, contentType);
        }
    }

    private boolean hasRequiredContentType(String contentType) {
        contentType = contentType.toLowerCase();
        return contentType.startsWith("image")
                || contentType.equals("application/pdf")
                || contentType.equals("application/msword")
                || contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || contentType.equals("text/html");
    }

    private int getPageSize(Page page) {
        return page.getContentData().length;
    }

    private String getContentType(Page page) {
        String contentType = page.getContentType();
        if (contentType.contains(";")) {
            contentType = contentType.substring(0, contentType.indexOf(';'));
        }
        return contentType;
    }

    private int getNumberOfOutlinks(Page page) {
        return page.getParseData().getOutgoingUrls().size();
    }
}
