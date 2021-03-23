# Remove old files
rm 'InvertedIndexJob$InvertedIndexMapper.class' 'InvertedIndexJob$InvertedIndexReducer.class' InvertedIndexJob.class InvertedIndexJob.java invertedindex.jar fulloutput.txt
hadoop fs -rm ./invertedindex.jar ./fulloutput.txt gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/JAR/invertedindex.jar gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/fulloutput.txt
hadoop fs -rm -r gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/fulloutput

# Upload java file

# Create jar
hadoop com.sun.tools.javac.Main InvertedIndexJob.java
jar cf invertedindex.jar InvertedIndex*.class

# Upload jar
hadoop fs -copyFromLocal ./invertedindex.jar
hadoop fs -cp ./invertedindex.jar gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/JAR

# Submit job

# Copy log to log.txt

# Generate and upload output
hadoop fs -rm gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/fulloutput/_SUCCESS
hadoop fs -getmerge gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/fulloutput ./fulloutput.txt
hadoop fs -copyFromLocal ./fulloutput.txt
hadoop fs -cp ./fulloutput.txt gs://dataproc-staging-us-west1-70935422459-yxtsyxqt/fulloutput.txt

# Download output

# Sort the output
sort -o fulloutput_sorted.txt fulloutput.txt

# Search for word
grep -w '^word' fulloutput_sorted.txt
