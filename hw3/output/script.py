import csv


def fulldata_document_index(req_document, input_file, output_file):
    with open(output_file, 'w') as o:
        writer = csv.writer(o, delimiter='\t')
        with open(input_file, 'r') as i:
            reader = csv.reader(i, delimiter='\t')
            for row in reader:
                word, *index = row
                for document_word_frequency in index:
                    document, _ = document_word_frequency.split(':')
                    if document == req_document:
                        writer.writerow([word, document_word_frequency])
                        break


def fulldata_index_sample(input_file, output_file):
    words = [
        'architecture',
        'technology',
        'temperature',
        'academics',
        'concurrent',
        'experiment',
        'catalogue',
        'hierarchy'
    ]

    words_set = set(words)

    word_row = {}

    with open(input_file, 'r') as i:
        reader = csv.reader(i, delimiter='\t')
        for row in reader:
            word, *index = row
            if word in words_set:
                word_row[word] = row

    with open(output_file, 'w') as o:
        writer = csv.writer(o, delimiter='\t')
        for word in words:
            row = word_row[word]
            writer.writerow(row)


def devdata_bigrams_index_sample(input_file, output_file):
    bigrams = [
        'computer science',
        'information retrieval',
        'power politics',
        'los angeles',
        'bruce willis'
    ]

    bigrams_set = set(bigrams)

    bigram_row = {}

    with open(input_file, 'r') as i:
        reader = csv.reader(i, delimiter='\t')
        for row in reader:
            bigram, *index = row
            if bigram in bigrams_set:
                bigram_row[bigram] = row

    with open(output_file, 'w') as o:
        writer = csv.writer(o, delimiter='\t')
        for bigram in bigrams:
            row = bigram_row[bigram]
            writer.writerow(row)


fulldata_document_index(
    '5722018484', './fulldata/output_sorted.txt', './fulldata/5722018484.txt')

fulldata_index_sample('./fulldata/output_sorted.txt',
                      './fulldata/index.txt')

devdata_bigrams_index_sample(
    './devdata_bigrams/output_sorted.txt', './devdata_bigrams/index_bigrams.txt')
