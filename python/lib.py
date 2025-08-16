import json
import re
from typing import Union


class ProgressiveJSON:
    def __init__(self):
        self._keys_need_replacing = []
        self.result = None

    def _extract_chunk_number(self, data: str):
        pattern = r'\$(\d+)'
        match = re.search(pattern, data)
        if match:
            return int(match.group(1))
        else:
            raise Exception(f"Couldn't find chunk number in {data}")

    def _extract_json_data(self, data: str):
        splitted = data.split("*/")
        if len(splitted) != 2:
            raise Exception("Something wrong is passed data")
        else:
            return splitted[1].strip()

    def _parse_str_chunked(self, data: str, chunk_number: Union[int, None] = None):
        chunked_data = json.loads(data)
        if isinstance(chunked_data, dict):
            self._parse_dict(chunked_data, chunk_number)
        elif isinstance(chunked_data, list):
            self._parse_list(chunked_data, chunk_number)
    
    def _parse_list(self, data: list, chunk_number: Union[int, None] = None):
        if not chunk_number:
            for item in data:
                if isinstance(item, str) and item.startswith("$"):
                    self.result = data
                elif isinstance(item, dict):
                    for val in item.values():
                        if isinstance(val, str) and val.startswith("$"):
                            self.result = data
        elif chunk_number:
            if isinstance(self.result, dict):
                self._replace_placeholders(self.result, data, chunk_number)
            elif isinstance(self.result, list):
                self._replace_placeholders_in_list(self.result, data, chunk_number)

    def parse_str(self, data: str):
        if data.startswith("/*"):
            chunk_number = self._extract_chunk_number(data)
            chunk_data = self._extract_json_data(data)
            if isinstance(chunk_number, int):
                self._parse_str_chunked(chunk_data, chunk_number)
        else:
            parsed_data = json.loads(data)
            if isinstance(parsed_data, dict):
                return json.dumps(self._parse_dict(parsed_data))
            elif isinstance(parsed_data, list):
                return json.dumps(self._parse_list(parsed_data))
    
    def _update_result(self, key, data):
        if self.result:
            self.result[key] = data

    def _parse_dict(self, data: dict, chunk_number: Union[int, None] = None):
        if not chunk_number:
            for (key, val) in data.items():
                if isinstance(val, str) and val.startswith("$"):
                    self.result = data
        elif chunk_number:
            if isinstance(self.result, dict):
                self._replace_placeholders(self.result, data, chunk_number)
    
    def _replace_placeholders(self, target_dict: dict, chunk_data, chunk_number: int):
        for (key, val) in target_dict.items():
            if isinstance(val, str) and val.startswith(f"${chunk_number}"):
                target_dict[key] = chunk_data
            elif isinstance(val, dict):
                self._replace_placeholders(val, chunk_data, chunk_number)
            elif isinstance(val, list):
                self._replace_placeholders_in_list(val, chunk_data, chunk_number)
    
    def _replace_placeholders_in_list(self, target_list: list, chunk_data, chunk_number: int):
        for i, item in enumerate(target_list):
            if isinstance(item, str) and item.startswith(f"${chunk_number}"):
                target_list[i] = chunk_data
            elif isinstance(item, dict):
                self._replace_placeholders(item, chunk_data, chunk_number)
            elif isinstance(item, list):
                self._replace_placeholders_in_list(item, chunk_data, chunk_number)
