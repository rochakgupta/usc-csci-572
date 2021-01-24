import json
import logging
import time
from collections import OrderedDict
from random import randint

import requests
from bs4 import BeautifulSoup

INPUT_DIR = "input"
OUTPUT_DIR = "output"

GOOGLE_RESULTS_JSON = f"{INPUT_DIR}/Google_Result3.json"
ASK_RESULTS_JSON = f"{OUTPUT_DIR}/hw1_unique.json"
STATISTICS_CSV = f"{OUTPUT_DIR}/hw1.csv"


class Logger:
    @staticmethod
    def init():
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    @staticmethod
    def info(message):
        logging.info(message)


class GoogleManager:
    def __init__(self):
        self.__results = OrderedDict()

    def load_results(self, json_file_path):
        Logger.info(f"Loading Google results from {json_file_path}")
        with open(json_file_path, "r") as f:
            self.__results = json.load(f, object_pairs_hook=OrderedDict)  # noqa

    def dump_results(self, dump_file_path):
        Logger.info(f"Dumping Google Results into {dump_file_path}")
        with open(dump_file_path, "w") as f:
            f.write(json.dumps(self.__results, indent=2))

    def get_results(self):
        return self.__results


def are_results_similar(first_result, second_result):
    def get_canonical_result(result):
        if result.startswith("http://"):
            result = result[7:]
        elif result.startswith("https://"):
            result = result[8:]
        if result.startswith("www."):
            result = result[4:]
        if result.endswith("/"):
            result = result[:-1]
        return result

    return get_canonical_result(first_result) == get_canonical_result(second_result)


class Ask:
    __MAX_RESULTS = 10
    # @formatter:off
    __USER_AGENT = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'} # noqa
    # @formatter:on

    @staticmethod
    def __build_url(query, page):
        return f"https://www.ask.com/web?q={query.replace(' ', '+')}&page={page}"

    @staticmethod
    def __fetch_html(query, page):
        url = Ask.__build_url(query, page)
        Logger.info(f"Fetching page {page}: {url}")
        return requests.get(url, headers=Ask.__USER_AGENT).text

    @staticmethod
    def __scrape(html):
        soup = BeautifulSoup(html, "html.parser")
        anchor_tags = soup.find_all("a", attrs={
            "class": "PartialSearchResults-item-title-link result-link"
        })
        return [anchor_tag.get('href') for anchor_tag in anchor_tags]

    @staticmethod
    def __sleep():
        seconds = randint(5, 10)
        time.sleep(seconds)

    @staticmethod
    def __find_unique_results(results):
        num_results = len(results)
        unique_results = []
        duplicates_indices = set()
        for i in range(0, num_results):
            if i not in duplicates_indices:
                first_result = results[i]
                unique_results.append(first_result)
                for j in range(i + 1, num_results):
                    second_result = results[j]
                    if are_results_similar(first_result, second_result):
                        duplicates_indices.add(j)
        return unique_results

    @staticmethod
    def search(query, sleep=True):
        results = []
        page = 1
        while True:
            if sleep:
                Ask.__sleep()
            html = Ask.__fetch_html(query, page)
            page_results = Ask.__scrape(html)
            if len(page_results) == 0:
                break
            results += page_results
            results = Ask.__find_unique_results(results)
            if len(results) >= Ask.__MAX_RESULTS:
                results = results[:Ask.__MAX_RESULTS]
                break
            page += 1
        return results


class AskManager:
    def __init__(self):
        self.__results = OrderedDict()

    def load_results(self, json_file_path):
        Logger.info(f"Loading Ask results from {json_file_path}")
        with open(json_file_path, "r") as f:
            self.__results = json.load(f, object_pairs_hook=OrderedDict)  # noqa

    def fetch_results(self, queries, sleep=True):
        Logger.info("Fetching Ask results")
        self.__results = OrderedDict()
        query_num = 1
        num_queries = len(queries)
        for query in queries:
            Logger.info(f"Fetching results for query {query_num}/{num_queries}: {query}")
            query_results = Ask.search(query, sleep)
            self.__results[query] = query_results
            query_num += 1

    def dump_results(self, dump_file_path):
        Logger.info(f"Dumping Ask Results into {dump_file_path}")
        with open(dump_file_path, "w") as f:
            f.write(json.dumps(self.__results, indent=2))

    def get_results(self):
        return self.__results


class ResultsComparator:
    __NUM_OVERLAPPING_MATCHES = "num_overlapping_matches"
    __SPEARMAN_CORRELATION = "spearman_correlation"

    def __init__(self, queries, google_results, ask_results):
        self.__queries = queries
        self.__google_results = google_results
        self.__ask_results = ask_results
        self.__queries_statistics = OrderedDict()
        self.__average_statistics = {}

    def __find_matches(self):
        matches = OrderedDict()
        for query in self.__queries:
            matches[query] = []
            query_google_results = self.__google_results[query]
            query_ask_results = self.__ask_results[query]
            matched_indices = set()
            for i in range(0, len(query_google_results)):
                query_google_result = query_google_results[i]
                for j in range(0, len(query_ask_results)):
                    query_ask_result = query_ask_results[j]
                    if j not in matched_indices and are_results_similar(query_google_result, query_ask_result):
                        matched_indices.add(j)
                        matches[query].append((i, j))
                        break
        return matches

    @staticmethod
    def __calculate_spearman_correlation(query_matches):
        num_matches = len(query_matches)
        if num_matches == 0:
            return 0
        elif num_matches == 1:
            google_rank, ask_rank = query_matches[0]
            if google_rank != ask_rank:
                return 0
            else:
                return 1
        else:
            sum_of_squared_rank_differences = 0
            for google_rank, ask_rank in query_matches:
                sum_of_squared_rank_differences += (google_rank - ask_rank) ** 2
            return 1 - ((6 * sum_of_squared_rank_differences) / (num_matches * ((num_matches ** 2) - 1)))

    def __calculate_queries_statistics(self, matches):
        for query, query_matches in matches.items():
            self.__queries_statistics[query] = {
                ResultsComparator.__NUM_OVERLAPPING_MATCHES: len(query_matches),
                ResultsComparator.__SPEARMAN_CORRELATION: ResultsComparator.__calculate_spearman_correlation(
                    query_matches)
            }

    def __calculate_average_statistics(self):
        def calculate_average_statistic_for(key):
            statistic_sum = 0
            for query, query_statistics in self.__queries_statistics.items():
                statistic_sum += query_statistics[key]
            self.__average_statistics[key] = statistic_sum / len(self.__queries_statistics)

        calculate_average_statistic_for(ResultsComparator.__NUM_OVERLAPPING_MATCHES)
        calculate_average_statistic_for(ResultsComparator.__SPEARMAN_CORRELATION)

    def compare(self):
        matches = self.__find_matches()
        self.__calculate_queries_statistics(matches)
        self.__calculate_average_statistics()

    def dump_results(self, dump_file_path):
        Logger.info(f"Dumping Statistics into {dump_file_path}")

        def write_query_statistics(f, query_num, query_statistics):
            num_overlapping_results = query_statistics[ResultsComparator.__NUM_OVERLAPPING_MATCHES]
            percent_overlap = round(num_overlapping_results * 10.0, 2)
            spearman_correlation = round(query_statistics[ResultsComparator.__SPEARMAN_CORRELATION], 2)
            f.write(f"Query {query_num}, {num_overlapping_results}, {percent_overlap}, {spearman_correlation}\n")

        def write_average_statistics(f):
            num_overlapping_results = round(self.__average_statistics[ResultsComparator.__NUM_OVERLAPPING_MATCHES], 2)
            percent_overlap = round(num_overlapping_results * 10.0, 2)
            spearman_correlation = round(self.__average_statistics[ResultsComparator.__SPEARMAN_CORRELATION], 2)
            f.write(f"Averages, {num_overlapping_results}, {percent_overlap}, {spearman_correlation}\n")

        with open(dump_file_path, "w") as f:
            f.write("Queries, Number of Overlapping Results, Percent Overlap, Spearman Correlation\n")
            for index, (_, query_statistics) in enumerate(self.__queries_statistics.items()):
                write_query_statistics(f, index + 1, query_statistics)
            write_average_statistics(f)


if __name__ == "__main__":
    Logger.init()

    google_manager = GoogleManager()
    google_manager.load_results(GOOGLE_RESULTS_JSON)
    google_results = google_manager.get_results()
    queries = google_results.keys()

    ask_manager = AskManager()
    ask_manager.load_results(ASK_RESULTS_JSON)
    ask_results = ask_manager.get_results()

    results_comparator = ResultsComparator(queries, google_results, ask_results)
    results_comparator.compare()
    results_comparator.dump_results(STATISTICS_CSV)
