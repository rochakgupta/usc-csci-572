import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.StringTokenizer;

public class BigramsInvertedIndexJob {

    public static class BigramsInvertedIndexMapper extends Mapper<Object, Text, Text, Text> {

        private final Text bigram = new Text();
        private final Text docId = new Text();

        @Override
        protected void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            String[] parts = value.toString().split("\\t");

            docId.set(parts[0]);

            String wordsString = parts[1].replaceAll("[^a-zA-Z]+", " ").toLowerCase(Locale.ROOT);
            StringTokenizer tokenizer = new StringTokenizer(wordsString, " ");
            String firstWord = null;
            String secondWord = null;
            while (tokenizer.hasMoreTokens()) {
                String wordString = tokenizer.nextToken();
                if (!wordString.trim().isEmpty()) {
                    if (firstWord == null) {
                        firstWord = wordString;
                        continue;
                    } else if (secondWord == null) {
                        secondWord = wordString;
                    } else {
                        firstWord = secondWord;
                        secondWord = wordString;
                    }
                    bigram.set(String.format("%s %s", firstWord, secondWord));

                    context.write(bigram, docId);
                }
            }
        }
    }

    public static class BigramsInvertedIndexReducer extends Reducer<Text, Text, Text, Text> {

        @Override
        public void reduce(Text bigram, Iterable<Text> docIds, Context context) throws IOException, InterruptedException {
            Map<String, Integer> docIdToBigramFrequencyMap = new HashMap<>();
            for (Text docId : docIds) {
                String docIdString = docId.toString();
                docIdToBigramFrequencyMap.put(docIdString, docIdToBigramFrequencyMap.getOrDefault(docIdString, 0) + 1);
            }

            StringBuilder docIdBigramFrequencies = new StringBuilder();
            for (Map.Entry<String, Integer> entry : docIdToBigramFrequencyMap.entrySet()) {
                if (docIdBigramFrequencies.length() > 0) {
                    docIdBigramFrequencies.append("\t");
                }
                String docId = entry.getKey();
                Integer bigramFrequency = entry.getValue();
                String docIdBigramFrequency = String.format("%s:%d", docId, bigramFrequency);
                docIdBigramFrequencies.append(docIdBigramFrequency);
            }

            context.write(bigram, new Text(docIdBigramFrequencies.toString()));
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {
        if (args.length != 2) {
            System.err.println("Usage: Bigrams Inverted Index <input path> <output path>");
            System.exit(-1);
        }
        String inputFile = args[0];
        String outputFile = args[1];

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Bigrams Inverted Index");
        job.setJarByClass(BigramsInvertedIndexJob.class);
        job.setMapperClass(BigramsInvertedIndexMapper.class);
        job.setReducerClass(BigramsInvertedIndexReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        Path inputFilePath = new Path(inputFile);
        Path outputFilePath = new Path(outputFile);
        FileSystem fileSystem = outputFilePath.getFileSystem(conf);
        if (fileSystem.exists(outputFilePath)) {
            fileSystem.delete(outputFilePath, true);
        }
        FileInputFormat.addInputPath(job, inputFilePath);
        FileOutputFormat.setOutputPath(job, outputFilePath);

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
