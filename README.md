# Progressive JSON

A progressive JSON parsing system that allows streaming and placeholder-based JSON reconstruction.

## Overview

This project implements a progressive JSON parser that can handle incomplete JSON documents with placeholders that get filled in as more data arrives. The system supports Python, TypeScript, and Next.js implementations with streaming capabilities via Server-Sent Events (SSE).

## Features

- **Progressive Parsing**: Parse JSON documents with placeholders (`$1`, `$2`, etc.)
- **Streaming Support**: Real-time data processing via SSE
- **Multi-language**: Python, TypeScript, and Next.js implementations
- **Client-Server Architecture**: Built-in streaming server and client
- **Modern Frontend**: Interactive Next.js web interface with real-time UI updates
- **Visual Loading States**: User-friendly loading indicators for placeholder values

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

### Next.js Frontend Implementation

```bash
cd prog-json-fe
npm install
npm run dev
```

Then open http://localhost:300X in your browser to see the interactive demo.

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

### Next.js Frontend
```bash
# Start the development server
cd prog-json-fe
npm run dev

# Open browser and click "Start Streaming"
```

The Next.js frontend provides an interactive web interface with:
- Real-time visual updates as data streams in
- Loading indicators for placeholder values ($1, $2, $3)
- Responsive design that works on all devices
- Clean, modern UI with smooth animations
- Configurable delay patterns (e.g., $3 takes 2-3 seconds longer)

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
├── prog-json-fe/        # Next.js frontend implementation
│   ├── app/            # Next.js app directory
│   │   ├── actions/    # Server actions
│   │   ├── api/        # API routes
│   │   └── page.tsx    # Main page
│   ├── components/     # React components
│   ├── lib/           # Utility libraries
│   └── README.md      # Frontend-specific documentation
├── COMPARISON.md       # Feature comparison
└── README.md           # This file
```

## Comparison

See [COMPARISON.md](COMPARISON.md) for detailed feature comparison between Python, TypeScript, and Next.js implementations.

### Implementation Highlights

- **Python**: Fast, lightweight, great for backend services
- **TypeScript**: Type-safe, modern JavaScript, good for Node.js applications
- **Next.js**: Full-stack web framework with interactive UI, ideal for web applications

### Choosing the Right Implementation

- **Use Python** for: Backend services, data processing, API endpoints
- **Use TypeScript** for: Node.js applications, CLI tools, server-side logic
- **Use Next.js** for: Web applications, interactive demos, user-facing interfaces

## License

MIT