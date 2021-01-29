import json
import logging
import time
from collections import OrderedDict
from random import randint

import requests
from bs4 import BeautifulSoup


class Logger:
    @staticmethod
    def init():
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    @staticmethod
    def info(message):
        logging.info(message)


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
    _MAX_RESULTS = 10
    # @formatter:off
    _USER_AGENT = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'} # noqa
    # @formatter:on

    @staticmethod
    def _build_url(query, page):
        return f"https://www.ask.com/web?q={query.replace(' ', '+')}&page={page}"

    @staticmethod
    def _fetch_html(query, page):
        url = Ask._build_url(query, page)
        Logger.info(f"Fetching page {page}: {url}")
        return requests.get(url, headers=Ask._USER_AGENT).text

    @staticmethod
    def _scrape(html):
        soup = BeautifulSoup(html, "html.parser")
        anchor_tags = soup.find_all("a", attrs={
            "class": "PartialSearchResults-item-title-link result-link"
        })
        return [anchor_tag.get('href') for anchor_tag in anchor_tags]

    @staticmethod
    def _sleep():
        seconds = randint(5, 10)
        time.sleep(seconds)

    @staticmethod
    def _find_unique_results(results):
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
    def search(query, sleep):
        results = []
        page = 1
        while True:
            if sleep:
                Ask._sleep()
            html = Ask._fetch_html(query, page)
            page_results = Ask._scrape(html)
            if len(page_results) == 0:
                break
            results += page_results
            results = Ask._find_unique_results(results)
            if len(results) >= Ask._MAX_RESULTS:
                results = results[:Ask._MAX_RESULTS]
                break
            page += 1
        return results


class Task:
    _INPUT_DIR = "input"
    _OUTPUT_DIR = "output"

    _NUM_OVERLAPPING_RESULTS_KEY = "num_overlapping_results"
    _SPEARMAN_COEFFICIENT_KEY = "spearman_coefficient"

    def __init__(self):
        Logger.init()
        self._queries_statistics = OrderedDict()
        self._average_statistics = {}

    @staticmethod
    def _get_input_file_path(file_name):
        return f"{Task._INPUT_DIR}/{file_name}"

    @staticmethod
    def _get_output_file_path(file_name):
        return f"{Task._OUTPUT_DIR}/{file_name}"

    @staticmethod
    def _load_results(file_path):
        with open(file_path, "r") as f:
            return json.load(f, object_pairs_hook=OrderedDict)  # noqa

    @staticmethod
    def _dump_results(results, file_path):
        with open(file_path, "w") as f:
            f.write(json.dumps(results, indent=2))

    @staticmethod
    def _get_google_results(google_results_file):
        google_results_file_path = Task._get_input_file_path(google_results_file)
        Logger.info(f"Loading Google results from {google_results_file_path}")
        return Task._load_results(google_results_file_path)

    @staticmethod
    def _fetch_ask_results(queries, sleep):
        results = OrderedDict()
        query_num = 1
        num_queries = len(queries)
        for query in queries:
            Logger.info(f"Fetching results for query {query_num}/{num_queries}: {query}")
            query_results = Ask.search(query, sleep)
            results[query] = query_results
            query_num += 1
        return results

    @staticmethod
    def _get_ask_results(ask_results_file, queries, scrape, sleep):
        ask_results_file_path = Task._get_output_file_path(ask_results_file)
        if scrape:
            Logger.info("Fetching Ask results")
            results = Task._fetch_ask_results(queries, sleep)
            Logger.info(f"Dumping Ask results into {ask_results_file_path}")
            Task._dump_results(results, ask_results_file_path)
            return results
        else:
            Logger.info(f"Loading Ask results from {ask_results_file_path}")
            return Task._load_results(ask_results_file_path)

    @staticmethod
    def _find_overlapping_results(google_results, ask_results):
        overlapping_results = OrderedDict()
        for query in google_results.keys():
            overlapping_results[query] = []
            query_google_results = google_results[query]
            query_ask_results = ask_results[query]
            overlapping_query_ask_results_indices = set()
            for i in range(0, len(query_google_results)):
                query_google_result = query_google_results[i]
                for j in range(0, len(query_ask_results)):
                    query_ask_result = query_ask_results[j]
                    if j not in overlapping_query_ask_results_indices and are_results_similar(query_google_result,
                                                                                              query_ask_result):
                        overlapping_query_ask_results_indices.add(j)
                        overlapping_results[query].append((i, j))
                        break
        return overlapping_results

    @staticmethod
    def _calculate_spearman_coefficient(query_overlapping_results):
        num_query_overlapping_results = len(query_overlapping_results)
        if num_query_overlapping_results == 0:
            return 0
        elif num_query_overlapping_results == 1:
            google_rank, ask_rank = query_overlapping_results[0]
            if google_rank != ask_rank:
                return 0
            else:
                return 1
        else:
            rank_differences_squared_sum = 0
            for google_rank, ask_rank in query_overlapping_results:
                rank_differences_squared_sum += (google_rank - ask_rank) ** 2
            return 1 - ((6 * rank_differences_squared_sum) / (
                    num_query_overlapping_results * ((num_query_overlapping_results ** 2) - 1)))

    def _calculate_queries_statistics(self, overlapping_results):
        for query, query_overlapping_results in overlapping_results.items():
            self._queries_statistics[query] = {
                Task._NUM_OVERLAPPING_RESULTS_KEY: len(query_overlapping_results),
                Task._SPEARMAN_COEFFICIENT_KEY: Task._calculate_spearman_coefficient(
                    query_overlapping_results)
            }

    def _calculate_average_statistics(self):
        def calculate_average_statistic_for(key):
            statistic_sum = 0
            for query, query_statistics in self._queries_statistics.items():
                statistic_sum += query_statistics[key]
            self._average_statistics[key] = statistic_sum / len(self._queries_statistics)

        calculate_average_statistic_for(Task._NUM_OVERLAPPING_RESULTS_KEY)
        calculate_average_statistic_for(Task._SPEARMAN_COEFFICIENT_KEY)

    def _compare_results(self, google_results, ask_results):
        overlapping_results = Task._find_overlapping_results(google_results, ask_results)
        self._calculate_queries_statistics(overlapping_results)
        self._calculate_average_statistics()

    def run(self, google_results_file, ask_results_file, scrape=True, sleep=True):
        google_results = Task._get_google_results(google_results_file)
        ask_results = Task._get_ask_results(ask_results_file, google_results.keys(), scrape, sleep if scrape else None)
        self._compare_results(google_results, ask_results)

    def write_statistics(self, statistics_file):
        statistics_file_path = Task._get_output_file_path(statistics_file)
        Logger.info(f"Writing statistics into {statistics_file_path}")

        def write_query_statistics(f, query_num, query_statistics):
            num_overlapping_results = query_statistics[Task._NUM_OVERLAPPING_RESULTS_KEY]
            percent_overlap = num_overlapping_results * 10.0
            spearman_coefficient = query_statistics[Task._SPEARMAN_COEFFICIENT_KEY]
            f.write(f"Query {query_num}, {num_overlapping_results}, {percent_overlap}, {spearman_coefficient}\n")

        def write_average_statistics(f):
            num_overlapping_results = self._average_statistics[Task._NUM_OVERLAPPING_RESULTS_KEY]
            percent_overlap = num_overlapping_results * 10.0
            spearman_coefficient = self._average_statistics[Task._SPEARMAN_COEFFICIENT_KEY]
            f.write(f"Averages, {num_overlapping_results}, {percent_overlap}, {spearman_coefficient}\n")

        with open(statistics_file_path, "w") as f:
            f.write("Queries, Number of Overlapping Results, Percent Overlap, Spearman Coefficient\n")
            for index, query_statistics in enumerate(self._queries_statistics.values()):
                write_query_statistics(f, index + 1, query_statistics)
            write_average_statistics(f)


if __name__ == "__main__":
    task = Task()
    task.run(google_results_file="Google_result3.json", ask_results_file="hw1_4.json", scrape=False)
    task.write_statistics(statistics_file="hw1_4.csv")
