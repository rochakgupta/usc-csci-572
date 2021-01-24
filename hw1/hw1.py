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


class Logger:
    @staticmethod
    def init():
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    @staticmethod
    def info(message):
        logging.info(message)


class GoogleManager:
    def __init__(self):
        self.__results = None

    def load_results(self, json_file_path):
        Logger.info(f"Loading Google results from {json_file_path}")
        with open(json_file_path, "r") as f:
            self.__results = json.load(f, object_pairs_hook=OrderedDict)  # noqa

    def dump_results(self, dump_file_path):
        Logger.info(f"Dumping Google Results into {dump_file_path}")
        with open(dump_file_path, "w") as f:
            f.write(json.dumps(self.__results, indent=2))

    def get_queries(self):
        return self.__results.keys()

    def get_results(self):
        return self.__results


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
    def __are_results_similar(first_result, second_result):
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
                    if Ask.__are_results_similar(first_result, second_result):
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
        self.__results = None

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


if __name__ == "__main__":
    Logger.init()
    google_manager = GoogleManager()
    google_manager.load_results(GOOGLE_RESULTS_JSON)
    ask_manager = AskManager()
    ask_manager.fetch_results(google_manager.get_queries(), sleep=True)
    ask_manager.dump_results(ASK_RESULTS_JSON)
