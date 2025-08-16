# Progressive JSON - TypeScript Implementation

A TypeScript implementation of progressive JSON parsing using Bun runtime. This allows for streaming and incremental JSON processing with placeholder replacement.

## Features

- **Progressive JSON Parsing**: Parse JSON chunks incrementally
- **Placeholder Replacement**: Replace placeholders like `$1`, `$2` with actual data
- **Streaming Support**: Built-in server and client for real-time streaming
- **TypeScript Support**: Full type safety with TypeScript
- **Bun Runtime**: Optimized for Bun's fast JavaScript runtime

## Installation

```bash
bun install
```

## Usage

### Basic Usage

```typescript
import { ProgressiveJSON } from './progressive-json.ts';

const progressiveJson = new ProgressiveJSON();
const chunks = [
  '{ "username": "john", "profile": "$1" }',
  '/* $1 */\n{ "age": 30, "city": "New York" }'
];

for (const chunk of chunks) {
  progressiveJson.parseStr(chunk);
}

console.log(progressiveJson.getResult());
// Output: { username: "john", profile: { age: 30, city: "New York" } }
```

### Running Examples

```bash
# Run basic example
bun run start

# Start streaming server
bun run server

# Run streaming client (requires server to be running)
bun run client
```

### Streaming Server

The server implements Server-Sent Events (SSE) for streaming progressive JSON chunks:

```typescript
// Start server on port 8000
bun run server
```

### Streaming Client

The client connects to the server and processes streaming chunks:

```typescript
// Connect to server and process chunks
bun run client
```

## API Reference

### ProgressiveJSON Class

#### `parseStr(data: string): string | void`
Parse a JSON string or chunk. Returns JSON string for initial parsing, void for chunked parsing.

#### `getResult(): ProgressiveJSONResult | any[] | null`
Get the current parsed result.

## Chunk Format

Chunks can be in two formats:

1. **Initial JSON**: Regular JSON with placeholders
   ```json
   { "user": "john", "details": "$1" }
   ```

2. **Chunked Data**: Comment with chunk number followed by JSON
   ```
   /* $1 */
   { "age": 30, "city": "NY" }
   ```

## Comparison with Python Implementation

This TypeScript implementation provides the same functionality as the Python version:

| Feature | Python | TypeScript |
|---------|--------|-----------|
| Progressive parsing | ✅ | ✅ |
| Placeholder replacement | ✅ | ✅ |
| Streaming server | ✅ | ✅ |
| Streaming client | ✅ | ✅ |
| Type safety | ❌ | ✅ |
| Runtime | Python | Bun |

## Development

This project uses:
- **TypeScript** for type safety
- **Bun** as the JavaScript runtime
- **ES Modules** for modern module system

## License

MIT
