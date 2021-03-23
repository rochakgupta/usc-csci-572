import csv


def fulldata_document_index():
    req_document = '5722018484'

    with open(f'./fulldata/{req_document}.txt', 'w') as o:
        writer = csv.writer(o, delimiter='\t')
        with open('./fulldata/output_sorted.txt', 'r') as i:
            reader = csv.reader(i, delimiter='\t')
            for row in reader:
                word, *index = row
                for document_word_frequency in index:
                    document, _ = document_word_frequency.split(':')
                    if document == req_document:
                        writer.writerow([word, document_word_frequency])
                        break


def fulldata_index_sample():
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

    with open('./fulldata/output_sorted.txt', 'r') as i:
        reader = csv.reader(i, delimiter='\t')
        for row in reader:
            word, *index = row
            if word in words_set:
                word_row[word] = row

    with open('./fulldata/index.txt', 'w') as o:
        writer = csv.writer(o, delimiter='\t')
        for word in words:
            row = word_row[word]
            writer.writerow(row)


def devdata_bigrams_index_sample():
    bigrams = [
        'computer science',
        'information retrieval',
        'power politics',
        'los angeles',
        'bruce willis'
    ]

    bigrams_set = set(bigrams)

    bigram_row = {}

    with open('./devdata_bigrams/output_sorted.txt', 'r') as i:
        reader = csv.reader(i, delimiter='\t')
        for row in reader:
            bigram, *index = row
            if bigram in bigrams_set:
                bigram_row[bigram] = row

    with open('./devdata_bigrams/index_bigrams.txt', 'w') as o:
        writer = csv.writer(o, delimiter='\t')
        for bigram in bigrams:
            row = bigram_row[bigram]
            writer.writerow(row)


fulldata_document_index()
fulldata_index_sample()
devdata_bigrams_index_sample()
