import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.html.HtmlParser;
import org.apache.tika.sax.BodyContentHandler;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.Objects;

public class Big {
    public static void main(final String[] args) throws IOException, SAXException, TikaException {
        PrintWriter out = new PrintWriter("big.txt");
        File dir = new File("/Users/rochakgupta/Documents/GitHub/usc-csci-572/hw4/data/latimes/latimes");
        for (File file : Objects.requireNonNull(dir.listFiles())) {
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            FileInputStream inputStream = new FileInputStream(file);
            ParseContext parseContext = new ParseContext();
            HtmlParser htmlparser = new HtmlParser();
            htmlparser.parse(inputStream, handler, metadata, parseContext);
            out.println(handler);
            String[] metadataNames = metadata.names();
            out.println(Arrays.toString(metadataNames));
        }
        out.close();
        out.flush();
    }
}