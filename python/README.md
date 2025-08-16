# Progressive JSON Parser

A Python implementation for parsing progressive JSON chunks with support for nested dictionaries and lists.

## Features

- **Progressive JSON Parsing**: Parse JSON data that arrives in chunks with placeholders
- **Nested Structure Support**: Handles nested dictionaries and lists
- **Server-Sent Events**: Real-time streaming of JSON chunks via FastAPI
- **Placeholder Resolution**: Automatically replaces `$1`, `$2`, etc. with corresponding chunk data

## Installation

1. Create and activate virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install fastapi uvicorn requests
```

## Usage

### Running the Server

Start the FastAPI server that streams progressive JSON chunks:

```bash
source .venv/bin/activate
python server.py
```

The server will start on `http://localhost:8000` with the following endpoints:
- `GET /`: Basic health check
- `GET /progressive-json`: Server-Sent Events endpoint for progressive JSON streaming

### Running the Client

Run the client to connect to the server and parse progressive JSON chunks:

```bash
source .venv/bin/activate
python client.py
```

The client will:
1. Connect to the SSE endpoint
2. Receive JSON chunks every 1 second
3. Parse each chunk using the progressive JSON parser
4. Display the current state after each chunk
5. Show the final assembled JSON

### Example Output

```
Starting to receive progressive JSON chunks...
==================================================
Received chunk: { "username": "darklord", "email": "darklord@hell.com", "pii": "$1", "hobbies": ["reading", "$2"], "friends": [{"name": "alice", "details": "$3"}] }
Current result: {
  "username": "darklord",
  "email": "darklord@hell.com",
  "pii": "$1",
  "hobbies": [
    "reading",
    "$2"
  ],
  "friends": [
    {
      "name": "alice",
      "details": "$3"
    }
  ]
}
------------------------------
Received chunk: /* $1 */
{ "age": 20, "address": "$2", "symptoms": "$3" }
Current result: {
  "username": "darklord",
  "email": "darklord@hell.com",
  "pii": {
    "age": 20,
    "address": "$2",
    "symptoms": "$3"
  },
  "hobbies": [
    "reading",
    "$2"
  ],
  "friends": [
    {
      "name": "alice",
      "details": "$3"
    }
  ]
}
------------------------------
... (more chunks) ...
==================================================
Final result: {
  "username": "darklord",
  "email": "darklord@hell.com",
  "pii": {
    "age": 20,
    "address": {
      "street": "a",
      "pincode": "111111"
    },
    "symptoms": [
      {
        "symptom": "some symptom"
      }
    ]
  },
  "hobbies": [
    "reading",
    {
      "street": "a",
      "pincode": "111111"
    }
  ],
  "friends": [
    {
      "name": "alice",
      "details": [
        {
          "symptom": "some symptom"
        }
      ]
    }
  ]
}
```

## Library Usage

You can also use the `ProgressiveJSON` class directly in your code:

```python
from lib import ProgressiveJSON

parser = ProgressiveJSON()

# Parse initial JSON with placeholders
parser.parse_str('{ "user": "$1", "items": ["$2"] }')

# Parse chunk data
parser.parse_str('/* $1 */\n{ "name": "John", "age": 30 }')
parser.parse_str('/* $2 */\n{ "id": 1, "value": "item1" }')

# Get the final result
print(parser.result)
# Output: {'user': {'name': 'John', 'age': 30}, 'items': [{'id': 1, 'value': 'item1'}]}
```

## API Reference

### ProgressiveJSON Class

#### Methods

- `parse_str(data: str)`: Parse a JSON string or chunk
- `_parse_dict(data: dict, chunk_number: Union[int, None] = None)`: Parse dictionary data
- `_parse_list(data: list, chunk_number: Union[int, None] = None)`: Parse list data
- `_replace_placeholders(target_dict: dict, chunk_data, chunk_number: int)`: Replace placeholders in dictionaries
- `_replace_placeholders_in_list(target_list: list, chunk_data, chunk_number: int)`: Replace placeholders in lists

#### Placeholder Format

- Use `$1`, `$2`, `$3`, etc. as placeholders
- Chunk data should be prefixed with `/* $N */` where N is the chunk number
- Both dictionaries and lists can be used as chunk data

## File Structure

```
.
├── lib.py              # Core ProgressiveJSON parser implementation
├── server.py           # FastAPI server with SSE endpoint
├── client.py           # Client that connects to server and parses chunks
├── main.py             # Basic usage example
├── AGENTS.md           # Agent guidelines and code style
└── README.md           # This file
```

## Testing

Run the basic test to verify the parser works:

```bash
source .venv/bin/activate
python main.py
```

## License

This project is open source and available under the MIT License.