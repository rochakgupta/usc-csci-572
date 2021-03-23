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

public class InvertedIndexJob {

    public static class InvertedIndexMapper extends Mapper<Object, Text, Text, Text> {

        private final Text word = new Text();
        private final Text docId = new Text();

        @Override
        protected void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            String[] parts = value.toString().split("\\t");

            docId.set(parts[0]);

            String wordsString = parts[1].replaceAll("[^a-zA-Z]+", " ").toLowerCase(Locale.ROOT);
            StringTokenizer tokenizer = new StringTokenizer(wordsString, " ");
            while (tokenizer.hasMoreTokens()) {
                String wordString = tokenizer.nextToken();
                if (!wordString.trim().isEmpty()) {
                    word.set(wordString);

                    context.write(word, docId);
                }
            }
        }
    }

    public static class InvertedIndexReducer extends Reducer<Text, Text, Text, Text> {

        @Override
        public void reduce(Text word, Iterable<Text> docIds, Context context) throws IOException, InterruptedException {
            Map<String, Integer> docIdToWordFrequencyMap = new HashMap<>();
            for (Text docId : docIds) {
                String docIdString = docId.toString();
                docIdToWordFrequencyMap.put(docIdString, docIdToWordFrequencyMap.getOrDefault(docIdString, 0) + 1);
            }

            StringBuilder docIdWordFrequencies = new StringBuilder();
            for (Map.Entry<String, Integer> entry : docIdToWordFrequencyMap.entrySet()) {
                if (docIdWordFrequencies.length() > 0) {
                    docIdWordFrequencies.append("\t");
                }
                String docId = entry.getKey();
                Integer wordFrequency = entry.getValue();
                String docIdWordFrequency = String.format("%s:%d", docId, wordFrequency);
                docIdWordFrequencies.append(docIdWordFrequency);
            }

            context.write(word, new Text(docIdWordFrequencies.toString()));
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {
        if (args.length != 2) {
            System.err.println("Usage: Inverted Index <input path> <output path>");
            System.exit(-1);
        }
        String inputFile = args[0];
        String outputFile = args[1];

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Inverted Index");
        job.setJarByClass(InvertedIndexJob.class);
        job.setMapperClass(InvertedIndexMapper.class);
        job.setReducerClass(InvertedIndexReducer.class);
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
