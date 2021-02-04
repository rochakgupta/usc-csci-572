import edu.uci.ics.crawler4j.crawler.Page;
import edu.uci.ics.crawler4j.crawler.WebCrawler;
import edu.uci.ics.crawler4j.url.WebURL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Pattern;

public class Crawler extends WebCrawler {

    private static final Logger logger = LoggerFactory.getLogger(Crawler.class);

    private static final Pattern DOC_PATTERNS = Pattern.compile(".*(\\.(html?|pdf|docx?|json|txt|xlsx?))$");

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
        String hostname = String.format("%s.%s", subdomain, domain);
        return hostname.equals(Config.WEBSITE_HOSTNAME);
    }

    private boolean hasExtension(WebURL url) {
        String path = url.getPath();
        String filename = path.substring(path.lastIndexOf("/") + 1);
        if (filename.length() == 0) {
            return false;
        }
        String extension = filename.substring(filename.lastIndexOf(".") + 1);
        if (extension.length() == 0) {
            return false;
        }
        return true;
    }

    private boolean hasRequiredExtension(WebURL url) {
        String path = url.getPath();
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
        int size = getPageSize(page);
        String contentType = getContentType(page);
        int numberOfOutlinks = getNumberOfOutlinks(page);
        Visited.add(url, size, numberOfOutlinks, contentType);
    }

    private int getPageSize(Page page) {
        return page.getContentData().length;
    }

    private String getContentType(Page page) {
        String contentType = page.getContentType();
        return contentType.substring(0, contentType.indexOf(';'));
    }

    private int getNumberOfOutlinks(Page page) {
        return page.getParseData().getOutgoingUrls().size();
    }

    @Override
    protected void onUnexpectedStatusCode(String urlStr, int statusCode, String contentType, String description) {
        super.onUnexpectedStatusCode(urlStr, statusCode, contentType, description);
    }

    @Override
    protected void onContentFetchError(WebURL webUrl) {
        super.onContentFetchError(webUrl);
    }

    @Override
    protected void onParseError(WebURL webUrl) {
        super.onParseError(webUrl);
    }
}
