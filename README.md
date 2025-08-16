# Progressive JSON

A progressive JSON parsing system that allows streaming and placeholder-based JSON reconstruction.

## Overview

This project implements a progressive JSON parser that can handle incomplete JSON documents with placeholders that get filled in as more data arrives. The system supports both Python and TypeScript implementations with streaming capabilities via Server-Sent Events (SSE).

## Features

- **Progressive Parsing**: Parse JSON documents with placeholders (`$1`, `$2`, etc.)
- **Streaming Support**: Real-time data processing via SSE
- **Multi-language**: Python and TypeScript implementations
- **Client-Server Architecture**: Built-in streaming server and client

## Quick Start

### Python Implementation

```bash
cd python
pip install -r requirements.txt
python main.py
```

### TypeScript Implementation

```bash
cd javascript
bun install
bun run main
```

## Streaming Demo

### Python
```bash
# Start server
python server.py

# Run client (in another terminal)
python client.py
```

### TypeScript
```bash
# Start server
bun run server

# Run client (in another terminal)
bun run client
```

## Example Usage

### Basic Parsing
```python
from lib import ProgressiveJSON

parser = ProgressiveJSON()
parser.parse_str('{ "user": "john", "profile": "$1" }')
parser.parse_str('/* $1 */\n{ "age": 30 }')
print(parser.result)  # { "user": "john", "profile": { "age": 30 } }
```

### TypeScript
```typescript
import { ProgressiveJSON } from './progressive-json.ts';

const parser = new ProgressiveJSON();
parser.parseStr('{ "user": "john", "profile": "$1" }');
parser.parseStr('/* $1 */\n{ "age": 30 }');
console.log(parser.getResult());  // { user: "john", profile: { age: 30 } }
```

## Architecture

```
progressive-json/
├── python/              # Python implementation
│   ├── lib.py          # Core parser
│   ├── server.py       # FastAPI streaming server
│   └── client.py       # Streaming client
├── javascript/         # TypeScript implementation
│   ├── progressive-json.ts  # Core parser
│   ├── server.ts       # Bun streaming server
│   └── client.ts       # Streaming client
└── README.md           # This file
```

## Comparison

See [COMPARISON.md](COMPARISON.md) for detailed feature comparison between Python and TypeScript implementations.

## License

MIT