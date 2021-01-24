import json
import logging
import pprint
import time
from collections import OrderedDict
from random import randint

import requests
from bs4 import BeautifulSoup

INPUT_DIR = "input"
OUTPUT_DIR = "output"

GOOGLE_RESULT_JSON = f"{INPUT_DIR}/Google_Result3.json"
ASK_RESULT_JSON = f"{OUTPUT_DIR}/hw1.json"


class GoogleManager:
    def __init__(self):
        self.__result = None

    def parse_result(self, json_file_path):
        logging.debug(f"Parsing Google results from {json_file_path}")
        with open(json_file_path, "r") as f:
            self.__result = json.load(f, object_pairs_hook=OrderedDict)  # noqa

    def dump_result(self, dump_file_path):
        logging.debug(f"Dumping Google Results into {dump_file_path}")
        with open(dump_file_path, "w") as f:
            f.write(json.dumps(self.__result, indent=2))

    def get_result(self):
        return self.__result


class Ask:
    __RESULT_LIMIT = 10
    # @formatter:off
    __USER_AGENT = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'} # noqa
    # @formatter:on

    @staticmethod
    def __build_url(query, page):
        return f"https://www.ask.com/web?q={query.replace(' ', '+')}&page={page}"

    @staticmethod
    def __fetch_html(query, page):
        url = Ask.__build_url(query, page)
        logging.debug(f"Fetching page {page}: {url}")
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
        seconds = randint(10, 25)
        time.sleep(seconds)

    @staticmethod
    def search(query, sleep=True):
        result = []
        page = 1
        while True:
            if sleep:
                Ask.__sleep()
            html = Ask.__fetch_html(query, page)
            page_result = Ask.__scrape(html)
            if len(page_result) == 0:
                break
            result += page_result
            if len(result) >= Ask.__RESULT_LIMIT:
                result = result[:Ask.__RESULT_LIMIT]
                break
            page += 1
        return result


class AskManager:
    def __init__(self, google_result):
        self.__google_result = google_result
        self.__result = None

    def parse_result(self, json_file_path):
        logging.debug(f"Parsing Ask results from {json_file_path}")
        with open(json_file_path, "r") as f:
            self.__result = json.load(f, object_pairs_hook=OrderedDict)  # noqa

    def fetch_result(self, sleep=True):
        logging.debug("Fetching Ask results")
        self.__result = OrderedDict()
        query_num = 1
        num_queries = len(self.__google_result)
        for query, _ in self.__google_result.items():
            logging.debug(f"Fetching results for query {query_num}/{num_queries}: {query}")
            query_result = Ask.search(query, sleep)
            self.__result[query] = query_result
            query_num += 1

    def dump_result(self, dump_file_path):
        logging.debug(f"Dumping Ask Results into {dump_file_path}")
        with open(dump_file_path, "w") as f:
            f.write(json.dumps(self.__result, indent=2))


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    pp = pprint.PrettyPrinter(indent=2)
    google_manager = GoogleManager()
    google_manager.parse_result(GOOGLE_RESULT_JSON)
    ask_manager = AskManager(google_manager.get_result())
    ask_manager.fetch_result(sleep=True)
    ask_manager.dump_result(ASK_RESULT_JSON)
