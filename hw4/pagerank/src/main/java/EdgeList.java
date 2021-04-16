import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.*;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class EdgeList {
    public static void main(String[] args) throws Exception {
        File filesDir = new File("/Users/rochakgupta/Documents/GitHub/usc-csci-572/hw4/data/latimes/latimes");
        File fileToUrlFile = new File(
                "/Users/rochakgupta/Documents/GitHub/usc-csci-572/hw4/data/URLtoHTML_latimes_news.csv");
        Set<String> edges = new HashSet<>();
        FileWriter writer = new FileWriter("./EdgeList.txt");
        HashMap<String, String> fileUrlMap = new HashMap<>();
        HashMap<String, String> urlFileMap = new HashMap<>();
        BufferedReader br = null;
        BufferedWriter bw = null;
        String line = "";
        try {
            br = new BufferedReader(new FileReader(fileToUrlFile));
            while ((line = br.readLine()) != null) {
                String[] tokens = line.split(",");
                fileUrlMap.put(tokens[0], tokens[1]);
                urlFileMap.put(tokens[1], tokens[0]);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        for (File file : Objects.requireNonNull(filesDir.listFiles())) {
            Document doc = Jsoup.parse(file, "UTF-8", fileUrlMap.get(file.getName()));
            Elements links = doc.select("a[href]");
            for (Element link : links) {
                String url = link.attr("abs:href").trim();
                if (urlFileMap.containsKey(url)) {
                    edges.add(file.getName() + " " + urlFileMap.get(url));
                }
            }
        }

        try {
            bw = new BufferedWriter(writer);
            for (String s : edges) {
                bw.write(s);
                bw.write("\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (bw != null) {
                try {
                    bw.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
