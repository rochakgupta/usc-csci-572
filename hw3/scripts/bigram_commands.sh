# Remove old files
rm 'BigramsInvertedIndexJob$BigramsInvertedIndexMapper.class' 'BigramsInvertedIndexJob$BigramsInvertedIndexReducer.class' BigramsInvertedIndexJob.class BigramsInvertedIndexJob.java bigramsinvertedindex.jar devoutput_bigrams.txt
hadoop fs -rm ./bigramsinvertedindex.jar ./devoutput_bigrams.txt gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/JAR/bigramsinvertedindex.jar gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/devoutput_bigrams.txt
hadoop fs -rm -r gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/devoutput_bigrams

# Upload java file

# Create jar
hadoop com.sun.tools.javac.Main BigramsInvertedIndexJob.java
jar cf bigramsinvertedindex.jar BigramsInvertedIndex*.class

# Upload jar
hadoop fs -copyFromLocal ./bigramsinvertedindex.jar
hadoop fs -cp ./bigramsinvertedindex.jar gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/JAR

# Submit job

# Copy log to log.txt

# Generate and upload output
hadoop fs -rm gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/devoutput_bigrams/_SUCCESS
hadoop fs -getmerge gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/devoutput_bigrams ./devoutput_bigrams.txt
hadoop fs -copyFromLocal ./devoutput_bigrams.txt
hadoop fs -cp ./devoutput_bigrams.txt gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/devoutput_bigrams.txt

# Download output

# Sort the output
sort -o devoutput_bigrams_sorted.txt devoutput_bigrams.txt

# Search for word
grep -w '^word' devoutput_bigrams_sorted.txt
